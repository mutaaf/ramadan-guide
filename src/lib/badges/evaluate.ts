import { BADGE_DEFINITIONS, type BadgeDefinition } from "./definitions";
import type { useStore } from "@/store/useStore";

// Flattened state derived from the store, consumed by badge conditions
export interface RamadanStoreState {
  onboarded: boolean;
  prayerStreak: number;
  juzCompleted: number;
  fastedDays: number;
  completedEpisodes: number;
  hasCompletedAnySeries: boolean;
  daysWithFullHydration: number;
  totalTasbeeh: number;

  // New fields for expanded badges
  totalPrayersLogged: number;
  taraweehCount: number;
  fajrStreak: number;
  hydrationStreak: number;
  totalGlassesLogged: number;
  daysWithAdequateSleep: number;
  sleepConsistencyScore: number;
  totalTrainingDays: number;
  trainingWhileFasting: number;
  daysWithGreatTraining: number;
  daysWithSahoor: number;
  daysWithIftar: number;
  daysWithAllMeals: number;
  tasbeehDaysActive: number;
  quranConsecutiveDays: number;
  journalEntries: number;
  daysWithGoals: number;
  daysWithGoodDeeds: number;
  totalBookmarks: number;
  savedActionItems: number;
  completedActionItems: number;
  hasPartner: boolean;
  hasCustomSchedule: boolean;
  totalDaysTracked: number;
  hasApiKey: boolean;
  daysWithCompleteLog: number;
}

export interface UnlockedBadge {
  definition: BadgeDefinition;
  isNew: boolean;
}

type StoreState = ReturnType<typeof useStore.getState>;

export function deriveRamadanState(store: StoreState): RamadanStoreState {
  const days = Object.values(store.days);
  const sortedDates = Object.keys(store.days).sort();

  // Single-pass computation over all days
  let fastedDays = 0;
  let totalPrayersLogged = 0;
  let taraweehCount = 0;
  let daysWithFullHydration = 0;
  let totalGlassesLogged = 0;
  let daysWithAdequateSleep = 0;
  let totalTrainingDays = 0;
  let trainingWhileFasting = 0;
  let daysWithGreatTraining = 0;
  let daysWithSahoor = 0;
  let daysWithIftar = 0;
  let daysWithAllMeals = 0;
  let journalEntries = 0;
  let daysWithGoals = 0;
  let daysWithGoodDeeds = 0;
  let totalDaysTracked = 0;
  let daysWithCompleteLog = 0;

  // For sleep consistency calculation
  const sleepHours: number[] = [];

  // For streak calculations (work on sorted dates)
  let fajrStreak = 0;
  let hydrationStreak = 0;
  let quranConsecutiveDays = 0;
  let tempFajrStreak = 0;
  let tempHydrationStreak = 0;
  let tempQuranStreak = 0;

  for (const day of days) {
    const hasSomeData =
      day.hoursOfSleep > 0 ||
      day.glassesOfWater > 0 ||
      day.prayers.fajr || day.prayers.dhur || day.prayers.asr ||
      day.prayers.maghrib || day.prayers.ishaa ||
      day.trainingType !== "" ||
      day.sahoorMeal !== "" || day.iftarMeal !== "" ||
      day.surahRead !== "" || day.firstThought !== "";

    if (hasSomeData) totalDaysTracked++;

    if (day.fasted) fastedDays++;

    const prayerCount = [day.prayers.fajr, day.prayers.dhur, day.prayers.asr, day.prayers.maghrib, day.prayers.ishaa]
      .filter(Boolean).length;
    totalPrayersLogged += prayerCount;

    if (day.prayers.taraweeh) taraweehCount++;
    if (day.glassesOfWater >= 8) daysWithFullHydration++;
    totalGlassesLogged += day.glassesOfWater;

    if (day.hoursOfSleep >= 7) daysWithAdequateSleep++;
    if (day.hoursOfSleep > 0) sleepHours.push(day.hoursOfSleep);

    if (day.trainingType && day.trainingType !== "rest") {
      totalTrainingDays++;
      if (day.fasted) trainingWhileFasting++;
      if (day.trainingFeeling === "great" || day.trainingFeeling === "fun") {
        daysWithGreatTraining++;
      }
    }

    if (day.sahoorMeal && day.sahoorMeal.trim() !== "") daysWithSahoor++;
    if (day.iftarMeal && day.iftarMeal.trim() !== "") daysWithIftar++;
    if (
      day.sahoorMeal && day.sahoorMeal.trim() !== "" &&
      day.iftarMeal && day.iftarMeal.trim() !== "" &&
      day.postTaraweehMeal && day.postTaraweehMeal.trim() !== ""
    ) {
      daysWithAllMeals++;
    }

    if (day.firstThought && day.firstThought.trim() !== "") journalEntries++;
    if (day.tomorrowGoals && day.tomorrowGoals.trim() !== "") daysWithGoals++;
    if (day.goodDeeds && day.goodDeeds.length > 0) daysWithGoodDeeds++;

    // Complete log: prayers + sleep + hydration all logged
    if (prayerCount > 0 && day.hoursOfSleep > 0 && day.glassesOfWater > 0) {
      daysWithCompleteLog++;
    }
  }

  // Compute streaks by iterating sorted dates in reverse
  const reversedDates = [...sortedDates].reverse();
  let fajrBroken = false;
  let hydrationBroken = false;
  let quranBroken = false;

  for (const date of reversedDates) {
    const day = store.days[date];
    if (!day) continue;

    if (!fajrBroken) {
      if (day.prayers.fajr) {
        tempFajrStreak++;
      } else {
        fajrBroken = true;
      }
    }
    if (!hydrationBroken) {
      if (day.glassesOfWater >= 8) {
        tempHydrationStreak++;
      } else {
        hydrationBroken = true;
      }
    }
    if (!quranBroken) {
      if (day.surahRead && day.surahRead.trim() !== "") {
        tempQuranStreak++;
      } else {
        quranBroken = true;
      }
    }

    if (fajrBroken && hydrationBroken && quranBroken) break;
  }
  fajrStreak = tempFajrStreak;
  hydrationStreak = tempHydrationStreak;
  quranConsecutiveDays = tempQuranStreak;

  // Sleep consistency score (0-100, low stddev = high)
  let sleepConsistencyScore = 0;
  if (sleepHours.length >= 3) {
    const mean = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
    const variance = sleepHours.reduce((sum, h) => sum + (h - mean) ** 2, 0) / sleepHours.length;
    const stddev = Math.sqrt(variance);
    // Map stddev 0->100, 3+->0
    sleepConsistencyScore = Math.max(0, Math.round(100 * (1 - stddev / 3)));
  }

  // Tasbeeh
  const totalTasbeeh = Object.values(store.tasbeehHistory).reduce((sum, dayHistory) => {
    return sum + Object.values(dayHistory).reduce((daySum, count) => daySum + count, 0);
  }, 0);

  const tasbeehDaysActive = Object.values(store.tasbeehHistory).filter((dayHistory) =>
    Object.values(dayHistory).some((count) => count > 0)
  ).length;

  // Juz
  const juzCompleted = store.juzProgress.filter((p) => p === 100).length;

  // Series
  const completedEpisodes = Object.values(store.seriesUserData.completedEpisodes).filter(Boolean).length;
  const seriesProgress = store.seriesUserData.seriesProgress;
  const completedEps = store.seriesUserData.completedEpisodes;
  const hasCompletedAnySeries = Object.keys(seriesProgress).some((seriesId) => {
    const seriesEpCount = Object.keys(completedEps).filter(
      (epId) => epId.startsWith(`${seriesId}-`) && completedEps[epId]
    ).length;
    return seriesEpCount >= 5;
  });

  const totalBookmarks = Object.values(store.seriesUserData.bookmarkedEpisodes).filter(Boolean).length;
  const allActionItems = Object.values(store.seriesUserData.savedActionItems ?? {});
  const savedActionItemsCount = allActionItems.length;
  const completedActionItemsCount = allActionItems.filter((item) => item.completed).length;

  return {
    onboarded: store.onboarded,
    prayerStreak: store.getPrayerStreak(),
    juzCompleted,
    fastedDays,
    completedEpisodes,
    hasCompletedAnySeries,
    daysWithFullHydration,
    totalTasbeeh,

    totalPrayersLogged,
    taraweehCount,
    fajrStreak,
    hydrationStreak,
    totalGlassesLogged,
    daysWithAdequateSleep,
    sleepConsistencyScore,
    totalTrainingDays,
    trainingWhileFasting,
    daysWithGreatTraining,
    daysWithSahoor,
    daysWithIftar,
    daysWithAllMeals,
    tasbeehDaysActive,
    quranConsecutiveDays,
    journalEntries,
    daysWithGoals,
    daysWithGoodDeeds,
    totalBookmarks,
    savedActionItems: savedActionItemsCount,
    completedActionItems: completedActionItemsCount,
    hasPartner: !!store.partnerStats,
    hasCustomSchedule: !!store.customSchedule,
    totalDaysTracked,
    hasApiKey: !!store.apiKey,
    daysWithCompleteLog,
  };
}

export function evaluateBadges(store: StoreState): UnlockedBadge[] {
  const state = deriveRamadanState(store);
  const seenBadges = store.userMemory.achievements;

  return BADGE_DEFINITIONS
    .filter((badge) => badge.condition(state))
    .map((definition) => ({
      definition,
      isNew: !seenBadges.includes(definition.id),
    }));
}
