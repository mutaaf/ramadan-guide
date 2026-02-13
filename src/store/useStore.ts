import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTodayString } from "@/lib/ramadan";
import type {
  HealthPatterns,
  SmartPromptSettings,
  QuickLogEngagement,
} from "@/lib/health/types";
import type { PartnerStats } from "@/lib/accountability/types";
import type { SeriesUserData, SavedActionItem } from "@/lib/series/types";
import { createDefaultSeriesUserData } from "@/lib/series/types";
import {
  DEFAULT_HEALTH_PATTERNS,
  DEFAULT_SMART_PROMPT_SETTINGS,
  DEFAULT_QUICK_LOG_ENGAGEMENT,
} from "@/lib/health/types";

export type RingId = "prayers" | "water" | "dhikr" | "quran" | "series";
export const DEFAULT_ENABLED_RINGS: RingId[] = ["prayers", "water", "dhikr"];

export type SportType = "football" | "basketball" | "soccer" | "track" | "swimming" | "mma" | "other" | "wellness";
export type ExperienceLevel = "beginner" | "intermediate" | "experienced";
export type FastingExperience = "first-time" | "some-years" | "many-years";
export type TrainingIntensity = "recreational" | "competitive" | "professional";

export interface UserProfile {
  userName: string;
  sport: SportType | "";
  experienceLevel: ExperienceLevel;
  fastingExperience: FastingExperience;
  trainingIntensity: TrainingIntensity;
  primaryGoals: string[];  // ["spiritual-growth", "maintain-fitness", "improve-prayer", "read-quran"]
  ramadanConcerns: string[];  // ["energy", "hydration", "performance", "sleep"]
}

export interface MemoryNote {
  date: string;
  context: string;
  insight: string;
  source: "ai-conversation" | "journal" | "manual";
}

export interface UserMemory {
  // Discovered preferences
  preferredMealTypes: string[];
  dietaryRestrictions: string[];
  sleepSchedule: string;

  // Interaction insights
  frequentTopics: string[];
  strugglingAreas: string[];
  achievements: string[];

  // Notes from conversations
  notes: MemoryNote[];

  interactionCount: number;
}

export const createDefaultUserProfile = (): UserProfile => ({
  userName: "",
  sport: "",
  experienceLevel: "beginner",
  fastingExperience: "first-time",
  trainingIntensity: "recreational",
  primaryGoals: [],
  ramadanConcerns: [],
});

export const createDefaultUserMemory = (): UserMemory => ({
  preferredMealTypes: [],
  dietaryRestrictions: [],
  sleepSchedule: "",
  frequentTopics: [],
  strugglingAreas: [],
  achievements: [],
  notes: [],
  interactionCount: 0,
});

export interface TasbeehCounter {
  id: string;
  name: string;
  arabicName: string;
  target: number;
  count: number;
}

export interface TasbeehHistory {
  [date: string]: {
    [counterId: string]: number;
  };
}

export const DEFAULT_TASBEEH_COUNTERS: TasbeehCounter[] = [
  { id: "subhanallah", name: "SubhanAllah", arabicName: "سبحان الله", target: 33, count: 0 },
  { id: "alhamdulillah", name: "Alhamdulillah", arabicName: "الحمد لله", target: 33, count: 0 },
  { id: "allahuakbar", name: "Allahu Akbar", arabicName: "الله أكبر", target: 33, count: 0 },
];

export interface DayEntry {
  date: string;
  hoursOfSleep: number;
  feelsRested: boolean;
  napMinutes: number;
  prayers: {
    fajr: boolean;
    dhur: boolean;
    asr: boolean;
    maghrib: boolean;
    ishaa: boolean;
    taraweeh: boolean;
  };
  glassesOfWater: number;
  hydrationDrinks: string[];
  sahoorMeal: string;
  iftarMeal: string;
  postTaraweehMeal: string;
  trainingType: "practice" | "weights" | "game" | "cardio" | "rest" | "other" | "";
  trainingFeeling: "tired" | "sad" | "angry" | "great" | "fun" | "relaxed" | "";
  urineColor: number;
  mood: string;
  surahRead: string;
  firstThought: string;
  goodDeeds: string[];
  tomorrowGoals: string;
  fasted: boolean;
}

export interface MaintenanceEntry {
  fasted: boolean;
  qiyam: boolean;
  quranPages: number;
  donated: boolean;
  dhikrMinutes: number;
}

// ── Custom Schedule Types ───────────────────────────────────────────────
export type ScheduleCategory =
  | "sleep" | "meal" | "prayer" | "quran"
  | "training" | "work" | "rest" | "other";

export interface ScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  category: ScheduleCategory;
  isFixed: boolean;
}

export interface ScheduleWizardAnswers {
  occupation: "student" | "working" | "athlete" | "flexible" | "practicing";
  workHours?: string;
  preferredTrainingTime: "morning" | "afternoon" | "evening" | "flexible";
  sessionLength: string;
  wakeTime: string;
  sleepHours: number;
  quranMinutes: number;
  taraweeh: "masjid" | "home" | "sometimes" | "skip";
  specialNotes?: string;
}

export interface CustomSchedule {
  blocks: ScheduleBlock[];
  createdAt: number;
  wizardAnswers: ScheduleWizardAnswers;
  reasoning?: string;
  tips?: string[];
}

const defaultPrayers = {
  fajr: false,
  dhur: false,
  asr: false,
  maghrib: false,
  ishaa: false,
  taraweeh: false,
};

export const createEmptyDay = (date: string): DayEntry => ({
  date,
  hoursOfSleep: 0,
  feelsRested: false,
  napMinutes: 0,
  prayers: { ...defaultPrayers },
  glassesOfWater: 0,
  hydrationDrinks: [],
  sahoorMeal: "",
  iftarMeal: "",
  postTaraweehMeal: "",
  trainingType: "",
  trainingFeeling: "",
  urineColor: 1,
  mood: "",
  surahRead: "",
  firstThought: "",
  goodDeeds: [],
  tomorrowGoals: "",
  fasted: true,
});

interface RamadanStore {
  userName: string;
  sport: string;
  onboarded: boolean;

  // User profile and memory
  userProfile: UserProfile;
  userMemory: UserMemory;

  checklist: Record<string, boolean>;
  days: Record<string, DayEntry>;
  juzProgress: number[];  // 0-100 for each Juz
  challengesCompleted: Record<string, boolean>;
  maintenanceDays: Record<string, MaintenanceEntry>;

  // Tasbeeh state
  tasbeehCounters: TasbeehCounter[];
  tasbeehHistory: TasbeehHistory;

  // AI config
  apiKey: string;
  aiModelPreference: string;
  useApiRoute: boolean;

  // Health patterns and smart prompts
  healthPatterns: HealthPatterns;
  smartPromptSettings: SmartPromptSettings;
  quickLogEngagement: QuickLogEngagement;
  entrySources: Record<string, Record<string, 'manual' | 'voice-journal' | 'quick-log' | 'smart-default'>>;

  setUser: (name: string, sport: string) => void;
  setOnboarded: (v: boolean) => void;
  toggleChecklist: (key: string) => void;
  getDay: (date: string) => DayEntry;
  updateDay: (date: string, data: Partial<DayEntry>) => void;
  togglePrayer: (date: string, prayer: keyof DayEntry["prayers"]) => void;
  addGlass: (date: string) => void;
  removeGlass: (date: string) => void;
  setJuzProgress: (index: number, progress: number) => void;
  toggleJuz: (index: number) => void;  // Quick toggle: 0 <-> 100
  toggleChallenge: (key: string) => void;

  // Tasbeeh actions
  incrementTasbeeh: (id: string) => void;
  resetTasbeeh: (id: string) => void;
  resetAllTasbeeh: () => void;
  getTasbeehTotalForDay: (date: string) => number;

  // User profile and memory actions
  updateUserProfile: (data: Partial<UserProfile>) => void;
  updateUserMemory: (data: Partial<UserMemory>) => void;
  addMemoryNote: (note: Omit<MemoryNote, "date">) => void;
  incrementInteractionCount: () => void;

  setApiKey: (key: string) => void;
  setAiModelPreference: (model: string) => void;
  setUseApiRoute: (v: boolean) => void;

  // Health pattern actions
  updateHealthPatterns: (patterns: HealthPatterns) => void;
  updateSmartPromptSettings: (settings: Partial<SmartPromptSettings>) => void;
  recordQuickLogAcceptance: (accepted: boolean) => void;
  setEntrySource: (date: string, field: string, source: 'manual' | 'voice-journal' | 'quick-log' | 'smart-default') => void;
  getEntrySource: (date: string, field: string) => 'manual' | 'voice-journal' | 'quick-log' | 'smart-default' | 'empty';

  // Custom schedule actions
  customSchedule: CustomSchedule | null;
  setCustomSchedule: (schedule: CustomSchedule) => void;
  updateScheduleBlock: (blockId: string, data: Partial<ScheduleBlock>) => void;
  addScheduleBlock: (block: ScheduleBlock) => void;
  removeScheduleBlock: (blockId: string) => void;
  clearCustomSchedule: () => void;

  // Accountability partner state
  partnerStats: PartnerStats | null;
  lastPartnerSync: number | null;
  setPartnerStats: (stats: PartnerStats | null) => void;
  setLastPartnerSync: (timestamp: number) => void;
  clearPartnerData: () => void;

  // Series companion data
  seriesUserData: SeriesUserData;
  toggleEpisodeComplete: (episodeId: string) => void;
  toggleEpisodeBookmark: (episodeId: string) => void;
  setEpisodeNote: (episodeId: string, note: string) => void;
  setLastViewed: (seriesId: string, episodeId: string) => void;
  updateSeriesProgress: (seriesId: string, episodeId: string) => void;
  toggleSaveActionItem: (item: { text: string; category: string; episodeId: string; seriesId: string; index: number }) => void;
  toggleActionItemComplete: (itemId: string) => void;

  // Ring configuration
  enabledRings: RingId[];
  toggleRing: (ringId: RingId) => void;

  // Badge actions
  markBadgesSeen: (ids: string[]) => void;

  // Helper to calculate prayer streak
  getPrayerStreak: () => number;
}

export const useStore = create<RamadanStore>()(
  persist(
    (set, get) => ({
      userName: "",
      sport: "",
      onboarded: false,

      userProfile: createDefaultUserProfile(),
      userMemory: createDefaultUserMemory(),

      checklist: {},
      days: {},
      juzProgress: Array(30).fill(0),
      challengesCompleted: {},
      maintenanceDays: {},

      tasbeehCounters: DEFAULT_TASBEEH_COUNTERS.map((c) => ({ ...c })),
      tasbeehHistory: {},

      apiKey: "",
      aiModelPreference: "",
      useApiRoute: false,

      // Health patterns and smart prompts
      healthPatterns: DEFAULT_HEALTH_PATTERNS,
      smartPromptSettings: DEFAULT_SMART_PROMPT_SETTINGS,
      quickLogEngagement: DEFAULT_QUICK_LOG_ENGAGEMENT,
      entrySources: {},

      // Custom schedule
      customSchedule: null,

      // Accountability partner
      partnerStats: null,
      lastPartnerSync: null,

      // Series companion
      seriesUserData: createDefaultSeriesUserData(),

      // Ring configuration
      enabledRings: DEFAULT_ENABLED_RINGS as RingId[],

      setUser: (name, sport) => set({ userName: name, sport }),
      setOnboarded: (v) => set({ onboarded: v }),
      setApiKey: (key) => set({ apiKey: key }),
      setAiModelPreference: (model) => set({ aiModelPreference: model }),
      setUseApiRoute: (v) => set({ useApiRoute: v }),

      toggleChecklist: (key) =>
        set((s) => ({
          checklist: { ...s.checklist, [key]: !s.checklist[key] },
        })),

      getDay: (date) => {
        const existing = get().days[date];
        return existing ?? createEmptyDay(date);
      },

      updateDay: (date, data) =>
        set((s) => {
          const existing = s.days[date] ?? createEmptyDay(date);
          return { days: { ...s.days, [date]: { ...existing, ...data } } };
        }),

      togglePrayer: (date, prayer) =>
        set((s) => {
          const existing = s.days[date] ?? createEmptyDay(date);
          return {
            days: {
              ...s.days,
              [date]: {
                ...existing,
                prayers: {
                  ...existing.prayers,
                  [prayer]: !existing.prayers[prayer],
                },
              },
            },
          };
        }),

      addGlass: (date) =>
        set((s) => {
          const existing = s.days[date] ?? createEmptyDay(date);
          if (existing.glassesOfWater >= 8) return s;
          return {
            days: {
              ...s.days,
              [date]: {
                ...existing,
                glassesOfWater: existing.glassesOfWater + 1,
              },
            },
          };
        }),

      removeGlass: (date) =>
        set((s) => {
          const existing = s.days[date] ?? createEmptyDay(date);
          if (existing.glassesOfWater <= 0) return s;
          return {
            days: {
              ...s.days,
              [date]: {
                ...existing,
                glassesOfWater: existing.glassesOfWater - 1,
              },
            },
          };
        }),

      setJuzProgress: (index, progress) =>
        set((s) => {
          const next = [...s.juzProgress];
          next[index] = Math.max(0, Math.min(100, progress));
          return { juzProgress: next };
        }),

      toggleJuz: (index) =>
        set((s) => {
          const next = [...s.juzProgress];
          next[index] = next[index] === 100 ? 0 : 100;
          return { juzProgress: next };
        }),

      incrementTasbeeh: (id) =>
        set((s) => {
          const today = getTodayString();
          const counters = s.tasbeehCounters.map((c) =>
            c.id === id ? { ...c, count: c.count + 1 } : c
          );
          const dayHistory = s.tasbeehHistory[today] || {};
          return {
            tasbeehCounters: counters,
            tasbeehHistory: {
              ...s.tasbeehHistory,
              [today]: {
                ...dayHistory,
                [id]: (dayHistory[id] || 0) + 1,
              },
            },
          };
        }),

      resetTasbeeh: (id) =>
        set((s) => ({
          tasbeehCounters: s.tasbeehCounters.map((c) =>
            c.id === id ? { ...c, count: 0 } : c
          ),
        })),

      resetAllTasbeeh: () =>
        set((s) => ({
          tasbeehCounters: s.tasbeehCounters.map((c) => ({ ...c, count: 0 })),
        })),

      getTasbeehTotalForDay: (date) => {
        const state = get();
        const dayHistory = state.tasbeehHistory[date];
        if (!dayHistory) return 0;
        return Object.values(dayHistory).reduce((sum, count) => sum + count, 0);
      },

      toggleChallenge: (key) =>
        set((s) => ({
          challengesCompleted: {
            ...s.challengesCompleted,
            [key]: !s.challengesCompleted[key],
          },
        })),

      updateUserProfile: (data) =>
        set((s) => ({
          userProfile: { ...s.userProfile, ...data },
          // Also sync userName and sport to legacy fields
          userName: data.userName ?? s.userName,
          sport: data.sport ?? s.sport,
        })),

      updateUserMemory: (data) =>
        set((s) => ({
          userMemory: { ...s.userMemory, ...data },
        })),

      addMemoryNote: (note) =>
        set((s) => ({
          userMemory: {
            ...s.userMemory,
            notes: [
              ...s.userMemory.notes,
              { ...note, date: getTodayString() },
            ].slice(-50), // Keep last 50 notes
          },
        })),

      incrementInteractionCount: () =>
        set((s) => ({
          userMemory: {
            ...s.userMemory,
            interactionCount: s.userMemory.interactionCount + 1,
          },
        })),

      // Health pattern actions
      updateHealthPatterns: (patterns) =>
        set({ healthPatterns: patterns }),

      updateSmartPromptSettings: (settings) =>
        set((s) => ({
          smartPromptSettings: { ...s.smartPromptSettings, ...settings },
        })),

      recordQuickLogAcceptance: (accepted) =>
        set((s) => {
          const { quickLogEngagement } = s;
          const totalSuggestions = quickLogEngagement.totalSuggestions + 1;
          const acceptedSuggestions = quickLogEngagement.acceptedSuggestions + (accepted ? 1 : 0);
          const acceptanceRate = totalSuggestions > 0
            ? Math.round((acceptedSuggestions / totalSuggestions) * 100)
            : 0;

          return {
            quickLogEngagement: {
              ...quickLogEngagement,
              totalSuggestions,
              acceptedSuggestions,
              acceptanceRate,
              daysWithQuickLog: quickLogEngagement.daysWithQuickLog + 1,
            },
          };
        }),

      setEntrySource: (date, field, source) =>
        set((s) => ({
          entrySources: {
            ...s.entrySources,
            [date]: {
              ...s.entrySources[date],
              [field]: source,
            },
          },
        })),

      getEntrySource: (date, field) => {
        const state = get();
        return state.entrySources[date]?.[field] || 'empty';
      },

      // Custom schedule actions
      setCustomSchedule: (schedule) =>
        set({ customSchedule: schedule }),

      updateScheduleBlock: (blockId, data) =>
        set((s) => {
          if (!s.customSchedule) return s;
          return {
            customSchedule: {
              ...s.customSchedule,
              blocks: s.customSchedule.blocks.map((block) =>
                block.id === blockId ? { ...block, ...data } : block
              ),
            },
          };
        }),

      addScheduleBlock: (block) =>
        set((s) => {
          if (!s.customSchedule) return s;
          return {
            customSchedule: {
              ...s.customSchedule,
              blocks: [...s.customSchedule.blocks, block].sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              ),
            },
          };
        }),

      removeScheduleBlock: (blockId) =>
        set((s) => {
          if (!s.customSchedule) return s;
          return {
            customSchedule: {
              ...s.customSchedule,
              blocks: s.customSchedule.blocks.filter((b) => b.id !== blockId),
            },
          };
        }),

      clearCustomSchedule: () =>
        set({ customSchedule: null }),

      // Accountability partner actions
      setPartnerStats: (stats) =>
        set({ partnerStats: stats }),

      setLastPartnerSync: (timestamp) =>
        set({ lastPartnerSync: timestamp }),

      clearPartnerData: () =>
        set({ partnerStats: null, lastPartnerSync: null }),

      // Series companion actions
      toggleEpisodeComplete: (episodeId) =>
        set((s) => ({
          seriesUserData: {
            ...s.seriesUserData,
            completedEpisodes: {
              ...s.seriesUserData.completedEpisodes,
              [episodeId]: !s.seriesUserData.completedEpisodes[episodeId],
            },
          },
        })),

      toggleEpisodeBookmark: (episodeId) =>
        set((s) => ({
          seriesUserData: {
            ...s.seriesUserData,
            bookmarkedEpisodes: {
              ...s.seriesUserData.bookmarkedEpisodes,
              [episodeId]: !s.seriesUserData.bookmarkedEpisodes[episodeId],
            },
          },
        })),

      setEpisodeNote: (episodeId, note) =>
        set((s) => ({
          seriesUserData: {
            ...s.seriesUserData,
            episodeNotes: {
              ...s.seriesUserData.episodeNotes,
              [episodeId]: note,
            },
          },
        })),

      setLastViewed: (seriesId, episodeId) =>
        set((s) => ({
          seriesUserData: {
            ...s.seriesUserData,
            lastViewed: { seriesId, episodeId, timestamp: Date.now() },
          },
        })),

      updateSeriesProgress: (seriesId, episodeId) =>
        set((s) => ({
          seriesUserData: {
            ...s.seriesUserData,
            seriesProgress: {
              ...s.seriesUserData.seriesProgress,
              [seriesId]: {
                startedAt: s.seriesUserData.seriesProgress[seriesId]?.startedAt ?? Date.now(),
                lastEpisodeId: episodeId,
              },
            },
          },
        })),

      toggleSaveActionItem: (item) =>
        set((s) => {
          const id = `${item.seriesId}:${item.episodeId}:${item.index}`;
          const savedItems = s.seriesUserData.savedActionItems ?? {};
          const existing = savedItems[id];
          if (existing) {
            const { [id]: _, ...rest } = savedItems;
            return { seriesUserData: { ...s.seriesUserData, savedActionItems: rest } };
          }
          const saved: SavedActionItem = {
            id,
            text: item.text,
            category: item.category as SavedActionItem["category"],
            episodeId: item.episodeId,
            seriesId: item.seriesId,
            completed: false,
            savedAt: Date.now(),
          };
          return {
            seriesUserData: {
              ...s.seriesUserData,
              savedActionItems: { ...savedItems, [id]: saved },
            },
          };
        }),

      toggleActionItemComplete: (itemId) =>
        set((s) => {
          const savedItems = s.seriesUserData.savedActionItems ?? {};
          const item = savedItems[itemId];
          if (!item) return s;
          return {
            seriesUserData: {
              ...s.seriesUserData,
              savedActionItems: {
                ...savedItems,
                [itemId]: { ...item, completed: !item.completed },
              },
            },
          };
        }),

      markBadgesSeen: (ids) =>
        set((s) => {
          const existing = s.userMemory.achievements;
          const newIds = ids.filter((id) => !existing.includes(id));
          if (newIds.length === 0) return s;
          return {
            userMemory: {
              ...s.userMemory,
              achievements: [...existing, ...newIds],
            },
          };
        }),

      toggleRing: (ringId) =>
        set((s) => {
          const current = s.enabledRings;
          if (current.includes(ringId)) {
            if (current.length <= 1) return s;
            return { enabledRings: current.filter((r) => r !== ringId) };
          }
          return { enabledRings: [...current, ringId] };
        }),

      getPrayerStreak: () => {
        const state = get();
        const sortedDates = Object.keys(state.days).sort().reverse();
        let streak = 0;

        for (const date of sortedDates) {
          const day = state.days[date];
          const prayers = day.prayers;
          const completed = [prayers.fajr, prayers.dhur, prayers.asr, prayers.maghrib, prayers.ishaa]
            .filter(Boolean).length;

          if (completed === 5) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: "ramadan-guide-storage",
      version: 9,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 0) {
          state.useApiRoute = false;
        }
        if (version < 2) {
          // Migrate juzCompleted boolean[] to juzProgress number[]
          const juzCompleted = state.juzCompleted as boolean[] | undefined;
          state.juzProgress = juzCompleted
            ? juzCompleted.map((done) => (done ? 100 : 0))
            : Array(30).fill(0);
          delete state.juzCompleted;
          // Initialize tasbeeh state
          state.tasbeehCounters = DEFAULT_TASBEEH_COUNTERS.map((c) => ({ ...c }));
          state.tasbeehHistory = {};
        }
        if (version < 3) {
          // Initialize userProfile from existing fields
          state.userProfile = {
            userName: (state.userName as string) || "",
            sport: (state.sport as string) || "",
            experienceLevel: "beginner",
            fastingExperience: "first-time",
            trainingIntensity: "recreational",
            primaryGoals: [],
            ramadanConcerns: [],
          };

          // Initialize userMemory
          state.userMemory = {
            preferredMealTypes: [],
            dietaryRestrictions: [],
            sleepSchedule: "",
            frequentTopics: [],
            strugglingAreas: [],
            achievements: [],
            notes: [],
            interactionCount: 0,
          };
        }
        if (version < 4) {
          // Initialize health patterns and smart prompt settings
          state.healthPatterns = DEFAULT_HEALTH_PATTERNS;
          state.smartPromptSettings = DEFAULT_SMART_PROMPT_SETTINGS;
          state.quickLogEngagement = DEFAULT_QUICK_LOG_ENGAGEMENT;
          state.entrySources = {};
        }
        if (version < 5) {
          // Initialize custom schedule
          state.customSchedule = null;
        }
        if (version < 6) {
          // Initialize accountability partner state
          state.partnerStats = null;
          state.lastPartnerSync = null;
        }
        if (version < 7) {
          // Initialize series companion data
          state.seriesUserData = createDefaultSeriesUserData();
        }
        if (version < 8) {
          // Add savedActionItems to existing seriesUserData
          const sud = state.seriesUserData as Record<string, unknown>;
          if (!sud.savedActionItems) sud.savedActionItems = {};
        }
        if (version < 9) {
          state.enabledRings = ["prayers", "water", "dhikr"];
        }
        return state as unknown as RamadanStore;
      },
    }
  )
);
