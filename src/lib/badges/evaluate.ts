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
}

export interface UnlockedBadge {
  definition: BadgeDefinition;
  isNew: boolean;
}

type StoreState = ReturnType<typeof useStore.getState>;

export function deriveRamadanState(store: StoreState): RamadanStoreState {
  const days = Object.values(store.days);

  const fastedDays = days.filter((d) => d.fasted).length;

  const juzCompleted = store.juzProgress.filter((p) => p === 100).length;

  const completedEpisodes = Object.values(store.seriesUserData.completedEpisodes).filter(Boolean).length;

  // Check if any series is fully completed
  // We check if all episodes of at least one series are completed
  // Since we don't have series episode counts in the store, we use seriesProgress
  // as a proxy — if a series has progress and all its known episodes are completed
  const seriesProgress = store.seriesUserData.seriesProgress;
  const completedEps = store.seriesUserData.completedEpisodes;
  const hasCompletedAnySeries = Object.keys(seriesProgress).some((seriesId) => {
    // Count episodes completed for this series (episode IDs contain the seriesId)
    const seriesEpCount = Object.keys(completedEps).filter(
      (epId) => epId.startsWith(`${seriesId}-`) && completedEps[epId]
    ).length;
    return seriesEpCount >= 5; // Minimum threshold for a "completed" series
  });

  const daysWithFullHydration = days.filter((d) => d.glassesOfWater >= 8).length;

  const totalTasbeeh = Object.values(store.tasbeehHistory).reduce((sum, dayHistory) => {
    return sum + Object.values(dayHistory).reduce((daySum, count) => daySum + count, 0);
  }, 0);

  return {
    onboarded: store.onboarded,
    prayerStreak: store.getPrayerStreak(),
    juzCompleted,
    fastedDays,
    completedEpisodes,
    hasCompletedAnySeries,
    daysWithFullHydration,
    totalTasbeeh,
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
