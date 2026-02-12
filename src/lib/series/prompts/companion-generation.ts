interface CompanionGenerationInput {
  transcript: string;
  scholarName: string;
  seriesTitle: string;
  episodeNumber: number;
  episodeTitle: string;
}

export function buildCompanionGenerationPrompts(input: CompanionGenerationInput) {
  const systemPrompt = `You are an expert Islamic studies assistant specializing in extracting structured knowledge from Islamic lecture transcripts. Your task is to analyze a lecture transcript and extract key information with academic rigor.

CRITICAL RULES:
1. Only extract hadiths that are explicitly mentioned in the lecture. Never fabricate hadiths.
2. For hadith sourcing, follow this tiered approach:
   a. If the scholar explicitly states the collection and/or number, use exactly what they say (e.g., "Sahih al-Bukhari 6018").
   b. If the scholar names only the collection, use the collection name (e.g., "Sahih Muslim").
   c. If the scholar does not name the source, use your hadith science knowledge to identify the most likely collection from the major books (Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Sunan an-Nasa'i, Jami at-Tirmidhi, Sunan Ibn Majah, Muwatta Malik, Musnad Ahmad) and prefix with "Likely: " (e.g., "Likely: Jami at-Tirmidhi").
   d. Use "Source to be verified" only as a last resort when you truly cannot identify the collection.
3. For Quranic verses, always provide the correct surah name and verse number.
4. Preserve the scholar's original context and intent for each reference.
5. Key quotes should be direct quotes or very close paraphrases from the transcript.
6. Themes should be concise topic tags (kebab-case).
7. Discussion questions should be open-ended, suitable for study circles.
8. Glossary terms should be Arabic/Islamic terms that may need explanation for a general audience.

CONTEXT:
- Scholar: ${input.scholarName}
- Series: ${input.seriesTitle}
- Episode ${input.episodeNumber}: ${input.episodeTitle}

Respond in JSON format with this exact structure:
{
  "summary": "2-4 sentence summary of the episode's main themes and message",
  "hadiths": [
    {
      "text": "The hadith text as mentioned by the scholar",
      "source": "Collection and number, e.g. 'Sahih al-Bukhari 1234', or 'Likely: Jami at-Tirmidhi', or 'Source to be verified'",
      "narrator": "Companion name with (RA) if known, or null",
      "context": "How the scholar used this hadith in the lecture"
    }
  ],
  "verses": [
    {
      "arabic": "Arabic text if mentioned, or null",
      "translation": "English translation as given by the scholar",
      "reference": "Surah Name X:Y format",
      "context": "How the scholar connected this verse to the topic"
    }
  ],
  "keyQuotes": [
    {
      "text": "Notable quote from the scholar",
      "timestamp": "Approximate timestamp if identifiable, or null"
    }
  ],
  "themes": ["theme-1", "theme-2"],
  "discussionQuestions": [
    {
      "question": "Open-ended question for study circles",
      "context": "Why this question is relevant to the episode"
    }
  ],
  "glossary": [
    {
      "term": "English transliteration",
      "arabic": "Arabic script if applicable",
      "definition": "Clear, concise definition",
      "context": "How it was used in this episode"
    }
  ]
}`;

  const userPrompt = `Analyze this transcript from "${input.episodeTitle}" (Episode ${input.episodeNumber} of "${input.seriesTitle}" by ${input.scholarName}):

---
${input.transcript}
---

Extract all hadiths, Quranic verses, key quotes, themes, discussion questions, and glossary terms. Be thorough but accurate — only include references that are clearly present in the transcript.`;

  return { systemPrompt, userPrompt };
}
