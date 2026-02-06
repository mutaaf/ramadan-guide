import { DayEntry } from "@/store/useStore";

export interface BehaviorAnalysis {
  hydrationTrend: string;
  prayerConsistency: string;
  sleepAverage: number;
  sleepTrend: string;
  moodPattern: string;
  trainingFrequency: string;
  streaks: string[];
  concerns: string[];
  achievements: string[];
}

export function analyzeBehavior(days: DayEntry[]): BehaviorAnalysis | null {
  if (days.length < 2) return null;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  const older = sorted.slice(0, -7);

  // Hydration trend
  const recentHydration =
    recent.reduce((sum, d) => sum + d.glassesOfWater, 0) / recent.length;
  const olderHydration =
    older.length > 0
      ? older.reduce((sum, d) => sum + d.glassesOfWater, 0) / older.length
      : recentHydration;
  const hydrationDiff = recentHydration - olderHydration;
  const hydrationTrend =
    hydrationDiff > 0.5
      ? `Improving (${recentHydration.toFixed(1)} avg glasses)`
      : hydrationDiff < -0.5
        ? `Declining (${recentHydration.toFixed(1)} avg glasses)`
        : `Stable (${recentHydration.toFixed(1)} avg glasses)`;

  // Prayer consistency
  const prayerCounts = recent.map(
    (d) => Object.values(d.prayers).filter(Boolean).length
  );
  const avgPrayers =
    prayerCounts.reduce((s, c) => s + c, 0) / prayerCounts.length;
  const prayerConsistency =
    avgPrayers >= 5
      ? "Excellent — all 5 daily prayers"
      : avgPrayers >= 3
        ? `Good — ${avgPrayers.toFixed(1)} average`
        : `Needs attention — ${avgPrayers.toFixed(1)} average`;

  // Sleep
  const sleepHours = recent
    .map((d) => d.hoursOfSleep)
    .filter((h) => h > 0);
  const sleepAverage =
    sleepHours.length > 0
      ? sleepHours.reduce((s, h) => s + h, 0) / sleepHours.length
      : 0;
  const sleepTrend =
    sleepAverage >= 7
      ? "Healthy range"
      : sleepAverage >= 5
        ? "Could improve — aim for 7+ hours"
        : "Low — prioritize rest";

  // Mood pattern
  const moods = recent.map((d) => d.mood).filter(Boolean);
  const moodCounts: Record<string, number> = {};
  for (const m of moods) {
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  }
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const moodPattern = topMood
    ? `Most common: ${topMood[0]} (${topMood[1]}/${moods.length} days)`
    : "Not enough mood data";

  // Training frequency
  const trainingDays = recent.filter(
    (d) => d.trainingType && d.trainingType !== "rest"
  ).length;
  const trainingFrequency = `${trainingDays}/${recent.length} days active`;

  // Streaks
  const streaks: string[] = [];
  let prayerStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    const all5 =
      d.prayers.fajr &&
      d.prayers.dhur &&
      d.prayers.asr &&
      d.prayers.maghrib &&
      d.prayers.ishaa;
    if (all5) prayerStreak++;
    else break;
  }
  if (prayerStreak >= 3) streaks.push(`${prayerStreak}-day prayer streak`);

  let fastingStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].fasted) fastingStreak++;
    else break;
  }
  if (fastingStreak >= 3) streaks.push(`${fastingStreak}-day fasting streak`);

  // Concerns
  const concerns: string[] = [];
  if (recentHydration < 4) concerns.push("Low hydration levels");
  if (sleepAverage < 5 && sleepAverage > 0)
    concerns.push("Sleep deprivation risk");
  if (avgPrayers < 3) concerns.push("Prayer consistency dropping");

  // Achievements
  const achievements: string[] = [];
  if (prayerStreak >= 5) achievements.push("Amazing prayer consistency");
  if (recentHydration >= 6) achievements.push("Excellent hydration habits");
  if (trainingDays >= 4) achievements.push("Strong training discipline");

  return {
    hydrationTrend,
    prayerConsistency,
    sleepAverage,
    sleepTrend,
    moodPattern,
    trainingFrequency,
    streaks,
    concerns,
    achievements,
  };
}
