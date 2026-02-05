import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { DailyCoachingInput } from "../types";

export function buildDailyCoachingPrompts(input: DailyCoachingInput) {
  const systemPrompt = COACH_HAMZA_SYSTEM_PROMPT;

  const recentSummary = input.recentDays
    .map((d) => {
      const prayers = Object.entries(d.prayers)
        .filter(([, v]) => v)
        .map(([k]) => k);
      return `- ${d.date}: Sleep ${d.hoursOfSleep}h, Water ${d.glassesOfWater}/8, Prayers [${prayers.join(", ")}], Mood: ${d.mood || "n/a"}, Training: ${d.trainingType || "none"}`;
    })
    .join("\n");

  const todayPrayers = Object.entries(input.today.prayers)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const userPrompt = `Generate personalized daily coaching for this Ramadan athlete.

## Today's Data (Day ${input.dayOfRamadan} of Ramadan)
- Name: ${input.userName || "Athlete"}
- Sport: ${input.sport || "General athletics"}
- Sleep: ${input.today.hoursOfSleep} hours, Rested: ${input.today.feelsRested}
- Hydration: ${input.today.glassesOfWater}/8 glasses, Urine color: ${input.today.urineColor}/8
- Prayers completed: [${todayPrayers.join(", ")}]
- Training: ${input.today.trainingType || "not logged yet"}
- Mood: ${input.today.mood || "not logged yet"}
- Fasting: ${input.today.fasted ? "Yes" : "No"}

## Recent History (last 3 days)
${recentSummary || "No previous days logged yet"}

Respond in this exact JSON format:
{
  "greeting": "Short personalized greeting using their name and referencing the day",
  "insights": ["Insight about their sleep/hydration/prayer pattern", "Second insight about trends", "Third actionable insight"],
  "tip": "One specific, practical tip for today based on their data",
  "encouragement": "Motivational closing that connects their athletic discipline to Ramadan"
}`;

  return { systemPrompt, userPrompt };
}
