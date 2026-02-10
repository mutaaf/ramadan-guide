import { DayEntry } from "@/store/useStore";
import { AppPhase } from "@/lib/ramadan";

// ── Feature identifiers ──────────────────────────────────────────────
export type AIFeature =
  | "daily-coaching"
  | "meal-plan"
  | "book-qa"
  | "weekly-analysis"
  | "training-advice"
  | "reflection"
  | "voice-journal"
  | "behavior-insight"
  | "ai-insights"
  | "schedule-generation";

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
  "ai-insights": 6 * 60 * 60 * 1000, // 6h
  "schedule-generation": 0, // no cache - always fresh
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
  "ai-insights": "gpt-4o-mini",
  "schedule-generation": "gpt-4o-mini",
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
  phase?: AppPhase;
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
  phase?: AppPhase;
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
  phase?: AppPhase;
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
  phase?: AppPhase;
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

// ── Feature 9: AI Insights (Dashboard) ────────────────────────────────
export interface AIInsightsInput {
  // Aggregated metrics
  daysTracked: number;
  avgSleep: number;
  avgHydration: number;
  avgPrayers: number;

  // Correlations
  sleepPrayerCorrelation: {
    highSleepPrayerRate: number;  // % Fajr on 7+ sleep days
    lowSleepPrayerRate: number;   // % Fajr on <7 sleep days
  } | null;

  // Streaks
  currentPrayerStreak: number;
  currentFastingStreak: number;
  currentFajrStreak: number;

  // Qur'an progress
  juzCompleted: number;
  juzPace: "ahead" | "on-track" | "behind";

  // Recent patterns
  recentMoods: string[];
  recentAchievements: string[];

  // User context
  userName: string;
  sport: string;
  dayOfRamadan: number;
  phase?: AppPhase;

  // Health patterns (from smart health data entry)
  healthPatterns?: {
    sleepConsistency: number;       // 0-100 score (low variance = high)
    hydrationTrend: 'improving' | 'stable' | 'declining';
    dataCompleteness: number;       // % of days with health data (0-100)
  };

  // Quick log engagement metrics
  quickLogEngagement?: {
    acceptanceRate: number;         // % suggestions accepted
    daysWithQuickLog: number;
  };
}

export interface AIInsightsOutput {
  headline: string;      // "Your Sleep-Prayer Connection"
  insight: string;       // The personalized observation
  metric?: {
    label: string;       // "Fajr Streak"
    value: string;       // "12 days"
    trend: "up" | "down" | "stable";
  };
  celebration?: string;  // Optional achievement callout
}

// ── Feature 10: Schedule Generation ────────────────────────────────────
export interface ScheduleGenerationInput {
  sport: string;
  trainingIntensity: string;
  occupation: "student" | "working" | "athlete" | "flexible";
  workHours?: string;
  preferredTime: "morning" | "afternoon" | "evening" | "flexible";
  sessionLength: string;
  wakeTime: string;
  sleepHours: number;
  quranMinutes: number;
  taraweeh: "masjid" | "home" | "sometimes" | "skip";
  specialNotes?: string;
  // Prayer times from user's location
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface ScheduleGenerationOutput {
  blocks: {
    startTime: string;  // "06:00"
    endTime: string;    // "07:00"
    activity: string;
    category: string;
    isFixed: boolean;
  }[];
  reasoning: string;
  tips: string[];
}
