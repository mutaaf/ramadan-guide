import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { ReflectionInput } from "../types";

export function buildReflectionPrompts(input: ReflectionInput) {
  const systemPrompt = COACH_HAMZA_SYSTEM_PROMPT;

  const phaseContext = input.phase === "pre-ramadan"
    ? "Pre-Ramadan preparation - building spiritual habits before the blessed month"
    : input.phase === "post-ramadan"
      ? "Post-Ramadan maintenance - continuing the spiritual momentum after Ramadan"
      : input.dayOfRamadan <= 10
        ? "First 10 days (Mercy)"
        : input.dayOfRamadan <= 20
          ? "Second 10 days (Forgiveness)"
          : "Last 10 days (Salvation from Hellfire)";

  const userPrompt = `Generate a personalized duaa and reflection.

## Today's Spiritual State (${input.phase === "ramadan" ? `Day ${input.dayOfRamadan} of Ramadan` : input.phase === "pre-ramadan" ? "Pre-Ramadan Preparation" : "Post-Ramadan Maintenance"})
- Mood: ${input.mood || "not shared"}
- Surah read: ${input.surahRead || "not logged yet"}
- First thought today: ${input.firstThought || "not shared"}
- Prayers completed: [${input.prayersCompleted.join(", ")}]

## Instructions
- Connect the duaa to their mood and what they've read/reflected on
- Use authentic Islamic duas (provide transliteration, not Arabic script)
- Make the reflection personal to their day and spiritual state
- If they read a specific surah, reference themes from that surah
- Context: ${phaseContext}

Respond in this exact JSON format:
{
  "duaa": "Transliterated duaa with English meaning in parentheses",
  "duaaArabic": "The duaa in simple transliterated Arabic text",
  "reflection": "Personal reflection connecting their mood, surah, and the day of Ramadan (2-3 sentences)",
  "connection": "How today's reading/state connects to their Ramadan journey (1-2 sentences)"
}`;

  return { systemPrompt, userPrompt };
}
