import type { CompanionGuide } from "../types";

type RegenerableSection =
  | "hadiths"
  | "verses"
  | "keyQuotes"
  | "actionItems"
  | "nextSteps"
  | "discussionQuestions"
  | "glossary"
  | "recommendedResources"
  | "summary";

interface SectionRegenInput {
  section: RegenerableSection;
  transcript: string;
  scholarName: string;
  seriesTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  existingCompanion: CompanionGuide;
  customPrompt?: string;
}

export function buildSectionRegenPrompts(input: SectionRegenInput) {
  const context = `Scholar: ${input.scholarName}
Series: ${input.seriesTitle}
Episode ${input.episodeNumber}: ${input.episodeTitle}`;

  const customInstructions = input.customPrompt
    ? `\n\nADDITIONAL INSTRUCTIONS FROM ADMIN:\n${input.customPrompt}`
    : "";

  const existingContext = `\nExisting companion summary: ${input.existingCompanion.summary}
Existing themes: ${input.existingCompanion.themes.join(", ")}`;

  switch (input.section) {
    case "hadiths":
      return {
        systemPrompt: `You are an expert Islamic studies assistant. Extract all hadiths mentioned in the transcript. Only include hadiths explicitly stated — never fabricate.

For hadith sourcing, follow this tiered approach:
1. If the scholar explicitly states the collection and/or number, use exactly what they say (e.g., "Sahih al-Bukhari 6018").
2. If the scholar names only the collection, use the collection name (e.g., "Sahih Muslim").
3. If the scholar does not name the source, use your hadith science knowledge to identify the most likely collection from the major books (Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Sunan an-Nasa'i, Jami at-Tirmidhi, Sunan Ibn Majah, Muwatta Malik, Musnad Ahmad) and prefix with "Likely: " (e.g., "Likely: Jami at-Tirmidhi").
4. Use "Source to be verified" only as a last resort when you truly cannot identify the collection.

${context}${existingContext}${customInstructions}

Respond in JSON: { "hadiths": [{ "text": "...", "source": "e.g. 'Sahih al-Bukhari 1234' or 'Likely: Jami at-Tirmidhi' or 'Source to be verified'", "narrator": "...", "context": "..." }] }`,
        userPrompt: `Extract all hadiths from this transcript:\n\n${input.transcript}`,
      };

    case "verses":
      return {
        systemPrompt: `You are an expert Islamic studies assistant. Extract all Quranic verses mentioned in the transcript. Provide correct surah name and verse numbers.

${context}${existingContext}${customInstructions}

Respond in JSON: { "verses": [{ "arabic": "...", "translation": "...", "reference": "Surah X:Y", "context": "..." }] }`,
        userPrompt: `Extract all Quranic verses from this transcript:\n\n${input.transcript}`,
      };

    case "keyQuotes":
      return {
        systemPrompt: `You are an Islamic studies assistant. Extract notable quotes from the scholar's lecture — direct quotes or very close paraphrases.

${context}${existingContext}${customInstructions}

Respond in JSON: { "keyQuotes": [{ "text": "...", "timestamp": "..." }] }`,
        userPrompt: `Extract key quotes from this transcript:\n\n${input.transcript}`,
      };

    case "actionItems":
      return {
        systemPrompt: `You are an Islamic education assistant. Generate 4-6 practical action items based on the lecture content.

Categories: "spiritual" (worship, dua), "practical" (habits, memorization), "social" (community, family), "study" (reading, tafsir).

${context}${existingContext}${customInstructions}

Respond in JSON: { "actionItems": [{ "text": "...", "category": "spiritual"|"practical"|"social"|"study" }] }`,
        userPrompt: `Generate action items from this transcript:\n\n${input.transcript}`,
      };

    case "nextSteps":
      return {
        systemPrompt: `You are an Islamic education assistant. Generate 2-3 next step suggestions for continued learning after this lecture.

${context}${existingContext}${customInstructions}

Respond in JSON: { "nextSteps": ["1-3 sentence suggestion", ...] }`,
        userPrompt: `Generate next steps from this transcript:\n\n${input.transcript}`,
      };

    case "discussionQuestions":
      return {
        systemPrompt: `You are an Islamic education assistant. Generate 3-5 open-ended discussion questions suitable for study circles or group reflection.

${context}${existingContext}${customInstructions}

Respond in JSON: { "discussionQuestions": [{ "question": "...", "context": "..." }] }`,
        userPrompt: `Generate discussion questions from this transcript:\n\n${input.transcript}`,
      };

    case "glossary":
      return {
        systemPrompt: `You are an Islamic studies assistant. Extract Arabic and Islamic terms mentioned in the transcript that may need explanation for a general audience.

${context}${existingContext}${customInstructions}

Respond in JSON: { "glossary": [{ "term": "...", "arabic": "...", "definition": "...", "context": "..." }] }`,
        userPrompt: `Extract glossary terms from this transcript:\n\n${input.transcript}`,
      };

    case "recommendedResources":
      return {
        systemPrompt: `You are an Islamic education assistant. Recommend 2-4 related resources (books, articles, tafsir, hadith collections) based on the episode's topics.

Types: "book", "article", "video", "tafsir", "hadith-collection".

${context}${existingContext}${customInstructions}

Respond in JSON: { "recommendedResources": [{ "title": "...", "type": "book"|"article"|"video"|"tafsir"|"hadith-collection", "description": "..." }] }`,
        userPrompt: `Recommend resources related to this transcript:\n\n${input.transcript}`,
      };

    case "summary":
      return {
        systemPrompt: `You are an Islamic studies assistant. Write a concise 2-4 sentence summary of the lecture's main themes and message.

${context}${existingContext}${customInstructions}

Respond in JSON: { "summary": "..." }`,
        userPrompt: `Summarize this transcript:\n\n${input.transcript}`,
      };
  }
}

export function getModelForSection(section: RegenerableSection): string {
  const extractionSections: RegenerableSection[] = ["hadiths", "verses", "keyQuotes", "glossary"];
  return extractionSections.includes(section) ? "gpt-4o" : "gpt-4o-mini";
}

export function getMaxTokensForSection(section: RegenerableSection): number {
  const largerSections: RegenerableSection[] = ["hadiths", "verses", "glossary"];
  return largerSections.includes(section) ? 4096 : 2048;
}
