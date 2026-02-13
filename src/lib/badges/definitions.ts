import type { RamadanStoreState } from "./evaluate";

export type BadgeTier = "bronze" | "silver" | "gold";
export type BadgeCategory = "journey" | "prayer" | "quran" | "fasting" | "wellness";

export interface BadgeDefinition {
  id: string;
  title: string;
  subtitle: string;
  shareText: string;
  category: BadgeCategory;
  tier: BadgeTier;
  condition: (state: RamadanStoreState) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Journey
  {
    id: "journey-start",
    title: "Bismillah",
    subtitle: "Started your Ramadan journey",
    shareText: "I started my Ramadan journey with Ramadan Companion!",
    category: "journey",
    tier: "bronze",
    condition: (s) => s.onboarded,
  },

  // Prayer
  {
    id: "prayer-streak-3",
    title: "Consistent",
    subtitle: "3-day all-prayers streak",
    shareText: "I prayed all 5 prayers for 3 days straight!",
    category: "prayer",
    tier: "bronze",
    condition: (s) => s.prayerStreak >= 3,
  },
  {
    id: "prayer-streak-7",
    title: "Steadfast",
    subtitle: "7-day all-prayers streak",
    shareText: "One full week of praying all 5 daily prayers!",
    category: "prayer",
    tier: "silver",
    condition: (s) => s.prayerStreak >= 7,
  },
  {
    id: "prayer-streak-21",
    title: "Devoted",
    subtitle: "21-day all-prayers streak",
    shareText: "21 days straight of all 5 daily prayers. Alhamdulillah!",
    category: "prayer",
    tier: "gold",
    condition: (s) => s.prayerStreak >= 21,
  },
  {
    id: "prayer-streak-30",
    title: "Perfect Month",
    subtitle: "30-day all-prayers streak",
    shareText: "A perfect month of prayer. Every prayer, every day. Allahu Akbar!",
    category: "prayer",
    tier: "gold",
    condition: (s) => s.prayerStreak >= 30,
  },

  // Quran
  {
    id: "quran-first-juz",
    title: "First Juz",
    subtitle: "Completed your first Juz",
    shareText: "I completed my first Juz of the Quran this Ramadan!",
    category: "quran",
    tier: "bronze",
    condition: (s) => s.juzCompleted >= 1,
  },
  {
    id: "quran-half",
    title: "Halfway There",
    subtitle: "15 Juz completed",
    shareText: "Halfway through the Quran this Ramadan! 15 Juz done.",
    category: "quran",
    tier: "silver",
    condition: (s) => s.juzCompleted >= 15,
  },
  {
    id: "quran-khatm",
    title: "Khatm al-Quran",
    subtitle: "Completed all 30 Juz",
    shareText: "I completed the entire Quran this Ramadan! Khatm al-Quran!",
    category: "quran",
    tier: "gold",
    condition: (s) => s.juzCompleted >= 30,
  },

  // Fasting
  {
    id: "first-fast",
    title: "First Fast",
    subtitle: "Completed your first day of fasting",
    shareText: "Completed my first fast this Ramadan!",
    category: "fasting",
    tier: "bronze",
    condition: (s) => s.fastedDays >= 1,
  },
  {
    id: "fasting-10",
    title: "10 Days Strong",
    subtitle: "10 days of fasting completed",
    shareText: "10 days of fasting this Ramadan! Going strong.",
    category: "fasting",
    tier: "silver",
    condition: (s) => s.fastedDays >= 10,
  },
  {
    id: "fasting-30",
    title: "Full Ramadan",
    subtitle: "30 days of fasting",
    shareText: "Fasted the entire month of Ramadan! Alhamdulillah!",
    category: "fasting",
    tier: "gold",
    condition: (s) => s.fastedDays >= 30,
  },

  // Wellness
  {
    id: "series-first",
    title: "First Guide",
    subtitle: "Completed a companion guide episode",
    shareText: "Completed my first AI Companion Guide episode!",
    category: "wellness",
    tier: "bronze",
    condition: (s) => s.completedEpisodes >= 1,
  },
  {
    id: "series-complete",
    title: "Series Scholar",
    subtitle: "Completed an entire series",
    shareText: "Completed an entire lecture series with the AI Companion!",
    category: "wellness",
    tier: "silver",
    condition: (s) => s.hasCompletedAnySeries,
  },
  {
    id: "hydration-7",
    title: "Well Hydrated",
    subtitle: "7 days with 8+ glasses of water",
    shareText: "Stayed hydrated during Ramadan — 7 days of 8+ glasses!",
    category: "wellness",
    tier: "silver",
    condition: (s) => s.daysWithFullHydration >= 7,
  },
  {
    id: "dhikr-1000",
    title: "Remembrance",
    subtitle: "1,000 cumulative tasbeeh",
    shareText: "1,000 tasbeeh counted this Ramadan. SubhanAllah!",
    category: "wellness",
    tier: "silver",
    condition: (s) => s.totalTasbeeh >= 1000,
  },
];
