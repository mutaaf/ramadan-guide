import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { VoiceJournalInput } from "../types";

export function buildVoiceJournalPrompts(input: VoiceJournalInput) {
  const systemPrompt =
    COACH_HAMZA_SYSTEM_PROMPT +
    `
## Voice Journal Parsing Instructions
You are parsing a spoken journal entry from a fasting athlete. Extract structured data from their natural language.
- Be generous in interpretation — "I prayed everything" means all 5 prayers + taraweeh
- "I slept well" with no hours mentioned → estimate 7-8 hours
- If something isn't mentioned, use empty string or 0 or false as appropriate
- Prayer names might be informal: "morning prayer" = fajr, "afternoon" = asr, "sunset" = maghrib, "night" = ishaa
- Training types: practice, weights, game, cardio, rest, other
- Mood values: Relaxed, Great, Fun, Tired, Sad, Angry
`;

  const userPrompt = `Parse this spoken journal entry into structured fields.

Transcript: "${input.transcript}"

Respond in this exact JSON format:
{
  "prayers": { "fajr": false, "dhur": false, "asr": false, "maghrib": false, "ishaa": false, "taraweeh": false },
  "hoursOfSleep": 0,
  "feelsRested": false,
  "mood": "",
  "trainingType": "",
  "sahoorMeal": "",
  "iftarMeal": "",
  "surahRead": "",
  "firstThought": "",
  "tomorrowGoals": "",
  "glassesOfWater": 0
}

Only include values that are clearly mentioned or strongly implied. Leave defaults for anything not mentioned.`;

  return { systemPrompt, userPrompt };
}
