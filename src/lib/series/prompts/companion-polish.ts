interface CompanionPolishInput {
  phase1Output: {
    summary: string;
    hadiths: { text: string; source: string; context: string }[];
    verses: { translation: string; reference: string; context: string }[];
    keyQuotes: { text: string }[];
    themes: string[];
  };
  scholarName: string;
  seriesTitle: string;
  episodeTitle: string;
}

export function buildCompanionPolishPrompts(input: CompanionPolishInput) {
  const systemPrompt = `You are an Islamic education assistant that creates practical, actionable takeaways from lecture analysis. Given a structured analysis of an Islamic lecture, generate action items and next steps that help the listener apply what they learned.

Action item categories:
- "spiritual": Acts of worship, dua, dhikr, reflection
- "practical": Daily habits, routines, memorization
- "social": Sharing knowledge, community engagement, family
- "study": Further reading, tafsir, hadith collections

Respond in JSON format:
{
  "actionItems": [
    {
      "text": "Clear, specific, achievable action",
      "category": "spiritual" | "practical" | "social" | "study"
    }
  ],
  "nextSteps": [
    "Suggestion for continued learning, 1-3 sentences each"
  ]
}`;

  const userPrompt = `Based on this analysis of "${input.episodeTitle}" from "${input.seriesTitle}" by ${input.scholarName}:

Summary: ${input.phase1Output.summary}

Key themes: ${input.phase1Output.themes.join(", ")}

Hadiths referenced: ${input.phase1Output.hadiths.map((h) => `"${h.text}" (${h.source})`).join("; ")}

Verses referenced: ${input.phase1Output.verses.map((v) => `${v.reference}: "${v.translation}"`).join("; ")}

Key quotes: ${input.phase1Output.keyQuotes.map((q) => `"${q.text}"`).join("; ")}

Generate 4-6 practical action items (at least one per category) and 2-3 next steps for the listener.`;

  return { systemPrompt, userPrompt };
}
