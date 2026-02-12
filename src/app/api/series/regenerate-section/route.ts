import { NextRequest, NextResponse } from "next/server";
import {
  buildSectionRegenPrompts,
  getModelForSection,
  getMaxTokensForSection,
} from "@/lib/series/prompts/section-regeneration";

export async function POST(req: NextRequest) {
  try {
    const {
      section,
      transcript,
      scholarName,
      seriesTitle,
      episodeNumber,
      episodeTitle,
      existingCompanion,
      customPrompt,
    } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server-side OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!section || !transcript || !scholarName || !seriesTitle || !episodeTitle || !existingCompanion) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validSections = [
      "hadiths", "verses", "keyQuotes", "actionItems", "nextSteps",
      "discussionQuestions", "glossary", "recommendedResources", "summary",
    ];
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: `Invalid section: ${section}` }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = buildSectionRegenPrompts({
      section,
      transcript,
      scholarName,
      seriesTitle,
      episodeNumber: episodeNumber || 1,
      episodeTitle,
      existingCompanion,
      customPrompt,
    });

    const model = getModelForSection(section);
    const maxTokens = getMaxTokensForSection(section);

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

    const sectionData = JSON.parse(json.choices[0].message.content);

    return NextResponse.json({ sectionData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Regeneration failed" },
      { status: 500 }
    );
  }
}
