import { NextRequest, NextResponse } from "next/server";
import { buildCompanionGenerationPrompts } from "@/lib/series/prompts/companion-generation";
import { buildCompanionPolishPrompts } from "@/lib/series/prompts/companion-polish";

const MAX_TRANSCRIPT_TOKENS = 12000; // ~48K chars, rough estimate

export async function POST(req: NextRequest) {
  try {
    const { transcript, scholarName, seriesTitle, episodeNumber, episodeTitle } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server-side OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!transcript || !scholarName || !seriesTitle || !episodeTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Chunk long transcripts
    const chunks = chunkTranscript(transcript, MAX_TRANSCRIPT_TOKENS * 4); // ~4 chars per token
    let phase1Results: Phase1Output[] = [];

    // Phase 1: Extract from each chunk
    for (const chunk of chunks) {
      const { systemPrompt, userPrompt } = buildCompanionGenerationPrompts({
        transcript: chunk,
        scholarName,
        seriesTitle,
        episodeNumber: episodeNumber || 1,
        episodeTitle,
      });

      const result = await callOpenAI(apiKey, systemPrompt, userPrompt, "gpt-4o", 4096);
      phase1Results.push(result as Phase1Output);
    }

    // Merge phase 1 results if multiple chunks
    const mergedPhase1 = mergePhase1Results(phase1Results);

    // Phase 2: Generate action items
    const { systemPrompt: p2System, userPrompt: p2User } = buildCompanionPolishPrompts({
      phase1Output: mergedPhase1,
      scholarName,
      seriesTitle,
      episodeTitle,
    });

    const phase2Result = await callOpenAI(apiKey, p2System, p2User, "gpt-4o-mini", 2048);

    // Combine results
    const companion = {
      episodeId: "", // Will be set by the admin
      generatedAt: new Date().toISOString(),
      summary: mergedPhase1.summary,
      hadiths: mergedPhase1.hadiths,
      verses: mergedPhase1.verses,
      keyQuotes: mergedPhase1.keyQuotes,
      actionItems: (phase2Result as Phase2Output).actionItems || [],
      nextSteps: (phase2Result as Phase2Output).nextSteps || [],
      themes: mergedPhase1.themes,
    };

    return NextResponse.json({ companion });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}

interface Phase1Output {
  summary: string;
  hadiths: { text: string; source: string; narrator?: string; context: string }[];
  verses: { arabic?: string; translation: string; reference: string; context: string }[];
  keyQuotes: { text: string; timestamp?: string }[];
  themes: string[];
}

interface Phase2Output {
  actionItems: { text: string; category: string }[];
  nextSteps: string[];
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model: string,
  maxTokens: number
): Promise<unknown> {
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
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        `OpenAI error: ${res.status}`
    );
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  return JSON.parse(json.choices[0].message.content);
}

function chunkTranscript(transcript: string, maxChars: number): string[] {
  if (transcript.length <= maxChars) return [transcript];

  const chunks: string[] = [];
  const sentences = transcript.split(/(?<=[.!?])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChars && current.length > 0) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence + " ";
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

function mergePhase1Results(results: Phase1Output[]): Phase1Output {
  if (results.length === 1) return results[0];

  return {
    summary: results.map((r) => r.summary).join(" "),
    hadiths: results.flatMap((r) => r.hadiths),
    verses: results.flatMap((r) => r.verses),
    keyQuotes: results.flatMap((r) => r.keyQuotes),
    themes: [...new Set(results.flatMap((r) => r.themes))],
  };
}
