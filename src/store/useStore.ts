import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  juzCompleted: boolean[];
  challengesCompleted: Record<string, boolean>;
  maintenanceDays: Record<string, MaintenanceEntry>;

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
  toggleJuz: (index: number) => void;
  toggleChallenge: (key: string) => void;
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
      juzCompleted: Array(30).fill(false),
      challengesCompleted: {},
      maintenanceDays: {},

      apiKey: "",
      aiModelPreference: "",
      useApiRoute: false,

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

      toggleJuz: (index) =>
        set((s) => {
          const next = [...s.juzCompleted];
          next[index] = !next[index];
          return { juzCompleted: next };
        }),

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
    }
  )
);
