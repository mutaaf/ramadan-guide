import { DayEntry } from "@/store/useStore";
import { analyzeBehavior } from "./behavior";

export interface DemoInsight {
  headline: string;
  insight: string;
  metric: {
    label: string;
    value: string;
    trend: "up" | "down" | "stable";
  };
  isDemo: true;
}

export interface LocalInsight {
  headline: string;
  insight: string;
  metric: {
    label: string;
    value: string;
    trend: "up" | "down" | "stable";
  };
  celebration?: string;
  isLocal: true;
}

// Preview insights for new users (< 3 days tracked)
const DEMO_INSIGHTS: DemoInsight[] = [
  {
    headline: "Your Sleep-Prayer Connection",
    insight:
      "We'll analyze how your sleep patterns affect Fajr prayer consistency. Athletes who sleep 7+ hours make Fajr 85% more often.",
    metric: { label: "Coming Soon", value: "Day 3", trend: "stable" },
    isDemo: true,
  },
  {
    headline: "Hydration Patterns",
    insight:
      "Track your hydration and we'll show trends like 'Your best training days follow 6+ glasses at Iftar'.",
    metric: { label: "Unlock at", value: "3 days", trend: "stable" },
    isDemo: true,
  },
  {
    headline: "Training Recovery Insights",
    insight:
      "We'll correlate your rest days with prayer consistency and mood to optimize your Ramadan training.",
    metric: { label: "Track to unlock", value: "3 days", trend: "up" },
    isDemo: true,
  },
  {
    headline: "Fasting Performance Impact",
    insight:
      "Discover how your fasting affects training intensity. We'll help you find your optimal training windows.",
    metric: { label: "Coming in", value: "3 days", trend: "stable" },
    isDemo: true,
  },
  {
    headline: "Mood & Spirituality Trends",
    insight:
      "Track how your prayer consistency correlates with mood. Many athletes report feeling most positive on full-prayer days.",
    metric: { label: "Unlock at", value: "3 days", trend: "up" },
    isDemo: true,
  },
];

/**
 * Get a rotating demo insight based on the current time
 * Changes every 8 hours to keep content fresh
 */
export function getDemoInsight(): DemoInsight {
  const hoursInCycle = 8;
  const now = new Date();
  const hoursSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60));
  const cycleIndex = Math.floor(hoursSinceEpoch / hoursInCycle);
  const insightIndex = cycleIndex % DEMO_INSIGHTS.length;
  return DEMO_INSIGHTS[insightIndex];
}

/**
 * Compute local insights from user data without needing AI API
 * Used when user has 3+ days tracked but no API key configured
 */
export function computeLocalInsight(days: Record<string, DayEntry>): LocalInsight | null {
  const dayArray = Object.values(days).filter((d) => d.date);
  if (dayArray.length < 3) return null;

  const sorted = [...dayArray].sort((a, b) => a.date.localeCompare(b.date));
  const behavior = analyzeBehavior(dayArray);
  if (!behavior) return null;

  // Calculate key metrics
  const recent = sorted.slice(-7);
  const avgPrayers =
    recent.reduce(
      (s, d) => s + Object.values(d.prayers).filter(Boolean).length,
      0
    ) / recent.length;

  // Calculate Fajr streak
  let fajrStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].prayers.fajr) fajrStreak++;
    else break;
  }

  // Calculate fasting streak
  let fastingStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].fasted) fastingStreak++;
    else break;
  }

  // Calculate hydration average
  const avgHydration =
    recent.reduce((s, d) => s + d.glassesOfWater, 0) / recent.length;

  // Calculate sleep average
  const sleepDays = recent.filter((d) => d.hoursOfSleep > 0);
  const avgSleep =
    sleepDays.length > 0
      ? sleepDays.reduce((s, d) => s + d.hoursOfSleep, 0) / sleepDays.length
      : 0;

  // Priority: Pick the most impactful insight to show
  // 1. Celebrate streaks first
  if (fajrStreak >= 5) {
    return {
      headline: "Fajr Champion",
      insight: `Incredible! You've prayed Fajr ${fajrStreak} days in a row. This consistency is building a powerful habit that will last beyond Ramadan.`,
      metric: { label: "Fajr Streak", value: `${fajrStreak} days`, trend: "up" },
      celebration: `${fajrStreak}-day Fajr streak achieved!`,
      isLocal: true,
    };
  }

  if (fastingStreak >= 7) {
    return {
      headline: "Steadfast Faster",
      insight: `MashaAllah! ${fastingStreak} consecutive fasting days. Your dedication to the fast is inspiring.`,
      metric: { label: "Fasting Streak", value: `${fastingStreak} days`, trend: "up" },
      celebration: `Perfect fasting for ${fastingStreak} days!`,
      isLocal: true,
    };
  }

  // 2. Highlight achievements
  if (avgHydration >= 6) {
    return {
      headline: "Hydration Master",
      insight: `You're averaging ${avgHydration.toFixed(1)} glasses of water daily — excellent for maintaining energy during fasts and training.`,
      metric: { label: "Avg Hydration", value: `${avgHydration.toFixed(1)} glasses`, trend: "up" },
      isLocal: true,
    };
  }

  if (avgPrayers >= 5) {
    return {
      headline: "Prayer Consistency",
      insight: `Your prayer consistency is excellent at ${avgPrayers.toFixed(1)}/6 daily prayers. This spiritual foundation supports all your other goals.`,
      metric: { label: "Daily Average", value: `${avgPrayers.toFixed(1)}/6`, trend: "up" },
      isLocal: true,
    };
  }

  // 3. Show progress on active streaks
  if (fajrStreak >= 2) {
    return {
      headline: "Building Your Streak",
      insight: `${fajrStreak} days of Fajr in a row! You're building momentum. Keep it going to unlock even deeper insights.`,
      metric: { label: "Fajr Streak", value: `${fajrStreak} days`, trend: "up" },
      isLocal: true,
    };
  }

  // 4. Encourage improvement areas
  if (avgHydration < 4 && avgHydration > 0) {
    const trend = behavior.hydrationTrend.includes("Improving") ? "up" : behavior.hydrationTrend.includes("Declining") ? "down" : "stable";
    return {
      headline: "Hydration Opportunity",
      insight: `You're averaging ${avgHydration.toFixed(1)} glasses daily. Aim for 6+ glasses between Iftar and Suhoor to boost energy and focus.`,
      metric: { label: "Current Avg", value: `${avgHydration.toFixed(1)} glasses`, trend },
      isLocal: true,
    };
  }

  if (avgSleep > 0 && avgSleep < 6) {
    return {
      headline: "Sleep for Success",
      insight: `Your ${avgSleep.toFixed(1)}hr sleep average may be affecting your energy. Athletes who get 7+ hours are 40% more likely to complete all prayers.`,
      metric: { label: "Avg Sleep", value: `${avgSleep.toFixed(1)} hrs`, trend: "stable" },
      isLocal: true,
    };
  }

  // 5. Default: Show tracking progress
  return {
    headline: "Your Ramadan Journey",
    insight: `You've tracked ${sorted.length} days with an average of ${avgPrayers.toFixed(1)}/6 prayers daily. Keep tracking to unlock personalized AI insights.`,
    metric: { label: "Days Tracked", value: `${sorted.length}`, trend: "up" },
    isLocal: true,
  };
}
