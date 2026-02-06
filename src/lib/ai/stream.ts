interface StreamOptions {
  useApiRoute?: boolean;
  apiKey?: string;
  signal?: AbortSignal;
}

export async function streamAIRequest(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  onChunk: (fullTextSoFar: string) => void,
  options: StreamOptions
): Promise<string> {
  const url = options.useApiRoute
    ? "/api/ai"
    : "https://api.openai.com/v1/chat/completions";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!options.useApiRoute && options.apiKey) {
    headers["Authorization"] = `Bearer ${options.apiKey}`;
  }

  const body = options.useApiRoute
    ? JSON.stringify({ systemPrompt, userPrompt, model, stream: true })
    : JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      });

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
    signal: options.signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      (err as { error?: string | { message?: string } })?.error;
    throw new Error(
      typeof message === "string"
        ? message
        : (message as { message?: string })?.message ?? `Error: ${res.status}`
    );
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onChunk(accumulated);
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return accumulated;
}
