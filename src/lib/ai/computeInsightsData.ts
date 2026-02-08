import { DayEntry } from "@/store/useStore";
import { analyzeBehavior } from "./behavior";
import { AIInsightsInput } from "./types";

export function computeInsightsData(
  days: Record<string, DayEntry>,
  userName: string,
  sport: string,
  juzProgress: number[],
  dayOfRamadan: number
): AIInsightsInput | null {
  const dayArray = Object.values(days).filter((d) => d.date);
  if (dayArray.length < 3) return null; // Need minimum data

  const sorted = [...dayArray].sort((a, b) => a.date.localeCompare(b.date));

  // Get base behavior analysis
  const behavior = analyzeBehavior(dayArray);

  // Compute averages
  const sleepDays = sorted.filter((d) => d.hoursOfSleep > 0);
  const avgSleep =
    sleepDays.length > 0
      ? sleepDays.reduce((s, d) => s + d.hoursOfSleep, 0) / sleepDays.length
      : 0;
  const avgHydration =
    sorted.reduce((s, d) => s + d.glassesOfWater, 0) / sorted.length;
  const avgPrayers =
    sorted.reduce(
      (s, d) => s + Object.values(d.prayers).filter(Boolean).length,
      0
    ) / sorted.length;

  // Sleep-Prayer Correlation Analysis
  const highSleepDays = sorted.filter((d) => d.hoursOfSleep >= 7);
  const lowSleepDays = sorted.filter(
    (d) => d.hoursOfSleep > 0 && d.hoursOfSleep < 7
  );

  const sleepPrayerCorrelation =
    highSleepDays.length >= 2 && lowSleepDays.length >= 2
      ? {
          highSleepPrayerRate: Math.round(
            (highSleepDays.filter((d) => d.prayers.fajr).length /
              highSleepDays.length) *
              100
          ),
          lowSleepPrayerRate: Math.round(
            (lowSleepDays.filter((d) => d.prayers.fajr).length /
              lowSleepDays.length) *
              100
          ),
        }
      : null;

  // Fajr-specific streak
  let fajrStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].prayers.fajr) fajrStreak++;
    else break;
  }

  // All-prayers streak (from behavior analysis)
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

  // Fasting streak
  let fastingStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].fasted) fastingStreak++;
    else break;
  }

  // Qur'an pace calculation
  const juzCompleted = juzProgress.filter((p) => p === 100).length;
  const expectedJuz = Math.floor(dayOfRamadan); // 1 juz/day pace
  const juzPace: "ahead" | "on-track" | "behind" =
    juzCompleted >= expectedJuz
      ? "ahead"
      : juzCompleted >= expectedJuz - 2
        ? "on-track"
        : "behind";

  // Recent moods (last 7 days)
  const recentMoods = sorted
    .slice(-7)
    .map((d) => d.mood)
    .filter(Boolean);

  return {
    daysTracked: sorted.length,
    avgSleep,
    avgHydration,
    avgPrayers,
    sleepPrayerCorrelation,
    currentFajrStreak: fajrStreak,
    currentPrayerStreak: prayerStreak,
    currentFastingStreak: fastingStreak,
    juzCompleted,
    juzPace,
    recentMoods,
    recentAchievements: behavior?.achievements || [],
    userName,
    sport,
    dayOfRamadan,
  };
}
