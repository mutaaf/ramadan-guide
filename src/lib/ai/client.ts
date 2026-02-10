import { AIFeature, FEATURE_MODEL } from "./types";
import { AICache } from "./cache";

interface ExecuteOptions {
  apiKey: string;
  useApiRoute?: boolean;
  modelOverride?: string;
}

export async function executeAIRequest<T>(
  feature: AIFeature,
  input: unknown,
  systemPrompt: string,
  userPrompt: string,
  options: ExecuteOptions
): Promise<{ data: T; cached: boolean; model: string }> {
  // 1. Check cache
  const cached = await AICache.get(feature, input);
  if (cached) {
    return {
      data: JSON.parse(cached) as T,
      cached: true,
      model: "cache",
    };
  }

  const model = options.modelOverride ?? FEATURE_MODEL[feature];

  // 2. Execute request
  let responseText: string;

  if (options.useApiRoute) {
    responseText = await fetchViaApiRoute(systemPrompt, userPrompt, model);
  } else {
    responseText = await fetchDirectOpenAI(
      systemPrompt,
      userPrompt,
      model,
      options.apiKey
    );
  }

  // 3. Parse JSON from response
  const data = parseJSONResponse<T>(responseText);

  // 4. Cache the result
  await AICache.set(feature, input, JSON.stringify(data));

  return { data, cached: false, model };
}

async function fetchDirectOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      (err as { error?: { message?: string } })?.error?.message ??
      `OpenAI API error: ${res.status}`;
    throw new Error(message);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return json.choices[0].message.content;
}

async function fetchViaApiRoute(
  systemPrompt: string,
  userPrompt: string,
  model: string
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemPrompt,
      userPrompt,
      model,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string })?.error ?? `API route error: ${res.status}`
    );
  }

  const json = (await res.json()) as { content: string };
  return json.content;
}

function parseJSONResponse<T>(text: string): T {
  // 1. Try direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // 2. Try to extract JSON from markdown code blocks
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (markdownMatch) {
      try {
        return JSON.parse(markdownMatch[1].trim()) as T;
      } catch {
        // Continue to next strategy
      }
    }

    // 3. Try finding a JSON object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {
        // Continue to next strategy
      }
    }

    // 4. Try finding a JSON array in the text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {
        // Fall through to error
      }
    }

    throw new Error("Failed to parse AI response as JSON");
  }
}
