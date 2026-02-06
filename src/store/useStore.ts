import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTodayString } from "@/lib/ramadan";

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

  setApiKey: (key: string) => void;
  setAiModelPreference: (model: string) => void;
  setUseApiRoute: (v: boolean) => void;
}

export const useStore = create<RamadanStore>()(
  persist(
    (set, get) => ({
      userName: "",
      sport: "",
      onboarded: false,

      checklist: {},
      days: {},
      juzProgress: Array(30).fill(0),
      challengesCompleted: {},
      maintenanceDays: {},

      tasbeehCounters: DEFAULT_TASBEEH_COUNTERS.map((c) => ({ ...c })),
      tasbeehHistory: {},

      apiKey: "",
      aiModelPreference: "",
      useApiRoute: true,

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
    }),
    {
      name: "ramadan-guide-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 0) {
          state.useApiRoute = true;
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
        return state as unknown as RamadanStore;
      },
    }
  )
);
