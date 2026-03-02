/**
 * Shared companion guide generation logic.
 * Used by both the admin generate API and the submissions generate API.
 */

import { buildCompanionGenerationPrompts } from "@/lib/series/prompts/companion-generation";
import { buildCompanionPolishPrompts } from "@/lib/series/prompts/companion-polish";
import { buildCrossEpisodePrompts } from "@/lib/series/prompts/cross-episode";
import type { CompanionGuide } from "./types";

const MAX_TRANSCRIPT_TOKENS = 12000; // ~48K chars, rough estimate

interface Phase1Output {
  summary: string;
  hadiths: { text: string; source: string; narrator?: string; context: string }[];
  verses: { arabic?: string; translation: string; reference: string; context: string }[];
  keyQuotes: { text: string; timestamp?: string }[];
  themes: string[];
  discussionQuestions?: { question: string; context?: string }[];
  glossary?: { term: string; arabic?: string; definition: string; context: string }[];
}

interface Phase2Output {
  actionItems: { text: string; category: "spiritual" | "practical" | "social" | "study" }[];
  nextSteps: string[];
  recommendedResources?: { title: string; type: "book" | "article" | "video" | "tafsir" | "hadith-collection"; description?: string }[];
}

interface GenerateCompanionOptions {
  transcript: string;
  scholarName: string;
  seriesTitle: string;
  episodeNumber?: number;
  episodeTitle: string;
  otherEpisodes?: { episodeId: string; episodeTitle: string; themes: string[]; summary: string }[];
}

export async function generateCompanionGuide(
  options: GenerateCompanionOptions
): Promise<Omit<CompanionGuide, "episodeId">> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Server-side OpenAI API key not configured");
  }

  const {
    transcript,
    scholarName,
    seriesTitle,
    episodeNumber = 1,
    episodeTitle,
    otherEpisodes,
  } = options;

  // Chunk long transcripts
  const chunks = chunkTranscript(transcript, MAX_TRANSCRIPT_TOKENS * 4);
  const phase1Results: Phase1Output[] = [];

  // Phase 1: Extract from each chunk
  for (const chunk of chunks) {
    const { systemPrompt, userPrompt } = buildCompanionGenerationPrompts({
      transcript: chunk,
      scholarName,
      seriesTitle,
      episodeNumber,
      episodeTitle,
    });

    const result = await callOpenAI(apiKey, systemPrompt, userPrompt, "gpt-4o", 6144);
    phase1Results.push(result as Phase1Output);
  }

  // Merge phase 1 results if multiple chunks
  const mergedPhase1 = mergePhase1Results(phase1Results);

  // Phase 2: Generate action items + resources
  const { systemPrompt: p2System, userPrompt: p2User } = buildCompanionPolishPrompts({
    phase1Output: mergedPhase1,
    scholarName,
    seriesTitle,
    episodeTitle,
  });

  const phase2Result = (await callOpenAI(apiKey, p2System, p2User, "gpt-4o-mini", 2048)) as Phase2Output;

  // Phase 3 (optional): Cross-episode connections
  let crossEpisodeConnections: { episodeId: string; episodeTitle: string; connection: string }[] = [];
  if (otherEpisodes && otherEpisodes.length > 0) {
    try {
      const { systemPrompt: p3System, userPrompt: p3User } = buildCrossEpisodePrompts({
        currentEpisode: {
          episodeId: "",
          episodeTitle,
          themes: mergedPhase1.themes,
          summary: mergedPhase1.summary,
        },
        otherEpisodes,
        seriesTitle,
        scholarName,
      });

      const p3Result = (await callOpenAI(apiKey, p3System, p3User, "gpt-4o-mini", 1024)) as {
        connections: { episodeId: string; episodeTitle: string; connection: string }[];
      };
      crossEpisodeConnections = p3Result.connections || [];
    } catch {
      // Cross-episode is optional, don't fail the whole generation
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: mergedPhase1.summary,
    hadiths: mergedPhase1.hadiths,
    verses: mergedPhase1.verses,
    keyQuotes: mergedPhase1.keyQuotes,
    actionItems: phase2Result.actionItems || [],
    nextSteps: phase2Result.nextSteps || [],
    themes: mergedPhase1.themes,
    discussionQuestions: mergedPhase1.discussionQuestions || [],
    glossary: mergedPhase1.glossary || [],
    recommendedResources: phase2Result.recommendedResources || [],
    ...(crossEpisodeConnections.length > 0 ? { crossEpisodeConnections } : {}),
  };
}

export async function callOpenAI(
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

export function chunkTranscript(transcript: string, maxChars: number): string[] {
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
    discussionQuestions: results.flatMap((r) => r.discussionQuestions ?? []),
    glossary: results.flatMap((r) => r.glossary ?? []),
  };
}
