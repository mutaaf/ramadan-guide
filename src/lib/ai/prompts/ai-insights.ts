import { AIInsightsInput } from "../types";
import { COACH_HAMZA_SYSTEM_PROMPT } from "./system";

export function buildAIInsightsPrompts(input: AIInsightsInput) {
  const systemPrompt = `${COACH_HAMZA_SYSTEM_PROMPT}

SPECIAL INSTRUCTIONS FOR PERSONALIZED INSIGHTS:
You are generating a single, powerful insight that makes the user feel truly known.
- Use EXACT numbers from their data (e.g., "6.2 hours", "87%")
- Find non-obvious correlations (sleep → prayer, hydration → mood)
- Celebrate achievements genuinely
- Keep the insight to 2-3 sentences maximum
- The headline should be intriguing (e.g., "Your Sleep-Prayer Connection")
- Make it feel like a personal observation, not generic advice`;

  const phaseLabel = input.phase === "pre-ramadan"
    ? "Pre-Ramadan preparation"
    : input.phase === "post-ramadan"
      ? "Post-Ramadan maintenance"
      : `Day ${input.dayOfRamadan} of Ramadan`;

  const userPrompt = `Generate a personalized insight for this athlete:

USER DATA:
- Name: ${input.userName || "Athlete"}
- Sport: ${input.sport || "General athletics"}
- Phase: ${phaseLabel}
- Days tracked: ${input.daysTracked}

METRICS:
- Average sleep: ${input.avgSleep.toFixed(1)} hours
- Average hydration: ${input.avgHydration.toFixed(1)} glasses
- Average prayers: ${input.avgPrayers.toFixed(1)}/5 daily

${
  input.sleepPrayerCorrelation
    ? `SLEEP-PRAYER CORRELATION:
- Fajr completion on 7+ hour sleep nights: ${input.sleepPrayerCorrelation.highSleepPrayerRate}%
- Fajr completion on <7 hour sleep nights: ${input.sleepPrayerCorrelation.lowSleepPrayerRate}%`
    : ""
}

STREAKS:
- Current Fajr streak: ${input.currentFajrStreak} days
- Current all-prayers streak: ${input.currentPrayerStreak} days
- Current fasting streak: ${input.currentFastingStreak} days

QUR'AN:
- Juz completed: ${input.juzCompleted}/30
- Pace: ${input.juzPace}

${
  input.healthPatterns
    ? `HEALTH PATTERNS:
- Sleep consistency: ${input.healthPatterns.sleepConsistency}% (higher = more consistent)
- Hydration trend: ${input.healthPatterns.hydrationTrend}
- Data completeness: ${input.healthPatterns.dataCompleteness}% of days logged`
    : ""
}

${
  input.quickLogEngagement && input.quickLogEngagement.daysWithQuickLog > 0
    ? `QUICK LOG ENGAGEMENT:
- Smart suggestion acceptance rate: ${input.quickLogEngagement.acceptanceRate}%
- Days using quick log: ${input.quickLogEngagement.daysWithQuickLog}`
    : ""
}

RECENT MOODS: ${input.recentMoods.join(", ") || "Not tracked"}
ACHIEVEMENTS: ${input.recentAchievements.join(", ") || "Building momentum"}

Generate ONE powerful insight. Respond in this exact JSON format:
{
  "headline": "Short intriguing title (3-5 words)",
  "insight": "2-3 sentences with specific numbers showing you truly understand their patterns",
  "metric": {
    "label": "Key stat label",
    "value": "The value",
    "trend": "up" | "down" | "stable"
  },
  "celebration": "Optional - only if there's a genuine achievement to celebrate"
}`;

  return { systemPrompt, userPrompt };
}
