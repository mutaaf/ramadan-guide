import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { TrainingAdviceInput } from "../types";

export function buildTrainingAdvicePrompts(input: TrainingAdviceInput) {
  const systemPrompt = COACH_HAMZA_SYSTEM_PROMPT;

  const flags: string[] = [];
  if (input.hoursOfSleep < 5) flags.push("LOW SLEEP (<5h)");
  if (input.hydrationLevel >= 6) flags.push("DEHYDRATED (urine color 6+)");
  if (input.glassesOfWater < 4) flags.push("LOW WATER INTAKE (<4 glasses)");
  if (!input.feelsRested) flags.push("NOT RESTED");
  if (input.mood === "Tired" || input.mood === "Sad" || input.mood === "Angry")
    flags.push(`MOOD: ${input.mood}`);

  const userPrompt = `Generate training advice for this fasting athlete.

## Today's Status (Day ${input.dayOfRamadan} of Ramadan)
- Sport: ${input.sport || "General athletics"}
- Training planned: ${input.trainingType || "none"}
- Sleep: ${input.hoursOfSleep} hours, Feels rested: ${input.feelsRested}
- Hydration: ${input.glassesOfWater}/8 glasses, Urine color: ${input.hydrationLevel}/8
- Mood: ${input.mood || "not logged"}
- Currently fasting: ${input.fasted ? "Yes" : "No"}

## Warning Flags
${flags.length > 0 ? flags.map((f) => `- ${f}`).join("\n") : "- None — all indicators look good"}

## Coach Hamza's Training Rules While Fasting
- Reduce intensity, not frequency
- Time training close to Iftar when possible (train 1-2h before)
- If dehydrated or sleep-deprived: reduce to 60-70% intensity
- Game days: maintain focus, adjust warm-up duration
- Listen to your body — it's okay to modify

Respond in this exact JSON format:
{
  "intensityPercent": 85,
  "warmUp": "Specific warm-up recommendation for their training type",
  "timing": "When to train relative to Iftar and prayer times",
  "warnings": ["Warning if any red flags", "Another warning if needed"],
  "recommendation": "Overall training recommendation for today (2-3 sentences)"
}`;

  return { systemPrompt, userPrompt };
}
