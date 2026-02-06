import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";
import { BehaviorInsightInput } from "../types";

export function buildBehaviorInsightPrompts(input: BehaviorInsightInput) {
  const systemPrompt =
    COACH_HAMZA_SYSTEM_PROMPT +
    `
## Proactive Insight Instructions
You are providing a proactive, data-driven insight based on the athlete's Ramadan patterns.
- Be specific — reference actual data trends
- Keep it encouraging but honest
- Suggest one concrete action they can take today
- Connect their athletic discipline to their spiritual journey
- Keep it concise — this appears as a card on the dashboard
`;

  const userPrompt = `Generate a proactive coaching insight based on these behavior patterns:

Athlete: ${input.userName || "Athlete"} (${input.sport || "General athletics"})
Day of Ramadan: ${input.dayOfRamadan}

## Patterns
- Hydration: ${input.hydrationTrend}
- Prayer: ${input.prayerConsistency}
- Sleep: ${input.sleepAverage.toFixed(1)}h average — ${input.sleepTrend}
- Mood: ${input.moodPattern}
- Training: ${input.trainingFrequency}

## Streaks
${input.streaks.length > 0 ? input.streaks.map((s) => `- ${s}`).join("\n") : "- No active streaks"}

## Concerns
${input.concerns.length > 0 ? input.concerns.map((c) => `- ${c}`).join("\n") : "- None detected"}

## Achievements
${input.achievements.length > 0 ? input.achievements.map((a) => `- ${a}`).join("\n") : "- Keep going!"}

Respond in this exact JSON format:
{
  "headline": "Short, attention-grabbing headline (5-8 words)",
  "insight": "1-2 sentence insight based on their specific patterns",
  "actionItem": "One specific, actionable thing they can do today",
  "motivation": "Brief motivational closing connecting athletic + spiritual discipline"
}`;

  return { systemPrompt, userPrompt };
}
