import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { WeeklyAnalysisInput } from "../types";

export function buildWeeklyAnalysisPrompts(input: WeeklyAnalysisInput) {
  const systemPrompt = COACH_HAMZA_SYSTEM_PROMPT;

  const daySummaries = input.days
    .map((d) => {
      const prayers = Object.entries(d.prayers)
        .filter(([, v]) => v)
        .map(([k]) => k);
      return `  ${d.date}: Sleep ${d.hoursOfSleep}h (rested: ${d.feelsRested}), Water ${d.glassesOfWater}/8, Urine ${d.urineColor}/8, Prayers [${prayers.join(",")}], Training: ${d.trainingType || "none"}, Mood: ${d.mood || "n/a"}, Fasted: ${d.fasted}`;
    })
    .join("\n");

  const userPrompt = `Analyze this athlete's week ${input.weekNumber} of Ramadan and provide trend insights.

## Athlete
- Name: ${input.userName || "Athlete"}
- Sport: ${input.sport || "General athletics"}

## This Week's Data (${input.days.length} days)
${daySummaries}

Analyze trends across hydration, sleep, prayer consistency, training load, and mood. Identify what's improving and what needs attention.

Respond in this exact JSON format:
{
  "summary": "2-3 sentence overview of the week",
  "trends": {
    "hydration": { "direction": "up|down|stable", "note": "Specific observation about hydration trend" },
    "sleep": { "direction": "up|down|stable", "note": "Specific observation about sleep pattern" },
    "prayer": { "direction": "up|down|stable", "note": "Specific observation about prayer consistency" },
    "training": { "direction": "up|down|stable", "note": "Specific observation about training pattern" },
    "mood": { "direction": "up|down|stable", "note": "Specific observation about mood trend" }
  },
  "topAchievement": "Best thing they did this week",
  "focusArea": "One specific area to improve next week with actionable advice",
  "coachMessage": "Motivational message from Coach Hamza about their week"
}`;

  return { systemPrompt, userPrompt };
}
