import { DayEntry } from "@/store/useStore";

// ── Feature identifiers ──────────────────────────────────────────────
export type AIFeature =
  | "daily-coaching"
  | "meal-plan"
  | "book-qa"
  | "weekly-analysis"
  | "training-advice"
  | "reflection"
  | "voice-journal"
  | "behavior-insight";

// ── Cache ─────────────────────────────────────────────────────────────
export interface CacheEntry {
  key: string;
  feature: AIFeature;
  data: string; // JSON-stringified response
  createdAt: number;
  ttl: number; // ms
  size: number; // bytes
}

export const FEATURE_TTL: Record<AIFeature, number> = {
  "daily-coaching": 4 * 60 * 60 * 1000, // 4h
  "meal-plan": 12 * 60 * 60 * 1000, // 12h
  "book-qa": 7 * 24 * 60 * 60 * 1000, // 7 days
  "weekly-analysis": 24 * 60 * 60 * 1000, // 24h
  "training-advice": 6 * 60 * 60 * 1000, // 6h
  reflection: 12 * 60 * 60 * 1000, // 12h
  "voice-journal": 0, // no cache
  "behavior-insight": 4 * 60 * 60 * 1000, // 4h
};

export const FEATURE_MODEL: Record<AIFeature, string> = {
  "daily-coaching": "gpt-4o-mini",
  "meal-plan": "gpt-4o-mini",
  "book-qa": "gpt-4o-mini",
  "weekly-analysis": "gpt-4o",
  "training-advice": "gpt-4o-mini",
  reflection: "gpt-4o-mini",
  "voice-journal": "gpt-4o-mini",
  "behavior-insight": "gpt-4o-mini",
};

// ── Transport ─────────────────────────────────────────────────────────
export interface AIRequest {
  feature: AIFeature;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
}

export interface AIResponse<T = unknown> {
  data: T;
  cached: boolean;
  model: string;
}

// ── Feature 1: Daily Coaching ─────────────────────────────────────────
export interface DailyCoachingInput {
  today: DayEntry;
  recentDays: DayEntry[];
  userName: string;
  sport: string;
  dayOfRamadan: number;
}

export interface DailyCoachingOutput {
  greeting: string;
  insights: string[];
  tip: string;
  encouragement: string;
}

// ── Feature 2: Meal Recommendations ──────────────────────────────────
export interface MealPlanInput {
  sport: string;
  trainingType: string;
  hydrationLevel: number; // urineColor 1-8
  glassesOfWater: number;
  dayOfRamadan: number;
}

export interface MealPlanOutput {
  sahoor: { foods: string[]; reasoning: string };
  iftar: { foods: string[]; reasoning: string };
  postTaraweeh: { foods: string[]; reasoning: string };
  hydrationPlan: string;
}

// ── Feature 3: Book Q&A ──────────────────────────────────────────────
export interface BookQAInput {
  question: string;
  context?: string;
}

export interface BookQAOutput {
  answer: string;
  bookReferences: string[];
  relatedTopics: string[];
}

// ── Feature 4: Weekly Analysis ───────────────────────────────────────
export interface WeeklyAnalysisInput {
  days: DayEntry[];
  userName: string;
  sport: string;
  weekNumber: number;
}

export interface WeeklyAnalysisOutput {
  summary: string;
  trends: {
    hydration: { direction: "up" | "down" | "stable"; note: string };
    sleep: { direction: "up" | "down" | "stable"; note: string };
    prayer: { direction: "up" | "down" | "stable"; note: string };
    training: { direction: "up" | "down" | "stable"; note: string };
    mood: { direction: "up" | "down" | "stable"; note: string };
  };
  topAchievement: string;
  focusArea: string;
  coachMessage: string;
}

// ── Feature 5: Training Advisor ──────────────────────────────────────
export interface TrainingAdviceInput {
  trainingType: string;
  hoursOfSleep: number;
  feelsRested: boolean;
  hydrationLevel: number;
  glassesOfWater: number;
  mood: string;
  sport: string;
  dayOfRamadan: number;
  fasted: boolean;
}

export interface TrainingAdviceOutput {
  intensityPercent: number;
  warmUp: string;
  timing: string;
  warnings: string[];
  recommendation: string;
}

// ── Feature 6: Reflection & Duaa ─────────────────────────────────────
export interface ReflectionInput {
  mood: string;
  surahRead: string;
  firstThought: string;
  dayOfRamadan: number;
  prayersCompleted: string[];
}

export interface ReflectionOutput {
  duaa: string;
  duaaArabic: string;
  reflection: string;
  connection: string;
}

// ── Feature 7: Voice Journal ─────────────────────────────────────────
export interface VoiceJournalInput {
  transcript: string;
}

export interface VoiceJournalOutput {
  prayers: Record<string, boolean>;
  hoursOfSleep: number;
  feelsRested: boolean;
  mood: string;
  trainingType: string;
  sahoorMeal: string;
  iftarMeal: string;
  surahRead: string;
  firstThought: string;
  tomorrowGoals: string;
  glassesOfWater: number;
}

// ── Feature 8: Behavior Insight ──────────────────────────────────────
export interface BehaviorInsightInput {
  hydrationTrend: string;
  prayerConsistency: string;
  sleepAverage: number;
  sleepTrend: string;
  moodPattern: string;
  trainingFrequency: string;
  streaks: string[];
  concerns: string[];
  achievements: string[];
  userName: string;
  sport: string;
  dayOfRamadan: number;
}

export interface BehaviorInsightOutput {
  headline: string;
  insight: string;
  actionItem: string;
  motivation: string;
}
