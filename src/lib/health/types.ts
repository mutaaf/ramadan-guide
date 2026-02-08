/**
 * Smart Health Data Entry System - Type Definitions
 *
 * Provides types for pattern detection, smart defaults, and health prompts.
 */

export interface HealthPatterns {
  // Sleep patterns
  typicalSleepHours: number;        // Rolling 14-day average
  sleepVariance: number;            // Standard deviation
  typicalRestedState: boolean;      // Most common response

  // Hydration patterns
  typicalGlasses: number;           // Daily average
  preferredDrinks: string[];        // Top 3 drinks by frequency

  // Meta
  lastPatternUpdate: number;        // Timestamp of last computation
  dataPointsAnalyzed: number;       // Number of days used
  confidence: 'high' | 'medium' | 'low';
}

export interface SmartPromptSettings {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  usePrayerTiming: boolean;         // Fajr+15min, Maghrib
  notificationsGranted: boolean;
  lastMorningPrompt: number | null; // Timestamp
  lastEveningPrompt: number | null; // Timestamp
}

export interface SmartSuggestion {
  value: number | boolean | string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  source: 'pattern' | 'default';
}

export interface QuickLogEntry {
  field: 'hoursOfSleep' | 'glassesOfWater' | 'feelsRested' | 'urineColor' | 'napMinutes';
  suggestedValue: SmartSuggestion;
  currentValue: number | boolean | string | null;
  accepted: boolean;
  timestamp: number;
}

export interface QuickLogState {
  entries: QuickLogEntry[];
  dismissed: boolean;
  lastInteraction: number | null;
}

export interface HealthMetrics {
  sleepConsistency: number;         // 0-100 score (low variance = high)
  hydrationTrend: 'improving' | 'stable' | 'declining';
  dataCompleteness: number;         // % of days with health data (0-100)
}

export interface QuickLogEngagement {
  acceptanceRate: number;           // % suggestions accepted (0-100)
  daysWithQuickLog: number;
  totalSuggestions: number;
  acceptedSuggestions: number;
}

// Types for AI insights extension
export interface HealthInsightsData {
  healthPatterns: HealthMetrics;
  quickLogEngagement: QuickLogEngagement;
}

// Default values
export const DEFAULT_HEALTH_PATTERNS: HealthPatterns = {
  typicalSleepHours: 7,
  sleepVariance: 1,
  typicalRestedState: true,
  typicalGlasses: 6,
  preferredDrinks: [],
  lastPatternUpdate: 0,
  dataPointsAnalyzed: 0,
  confidence: 'low',
};

export const DEFAULT_SMART_PROMPT_SETTINGS: SmartPromptSettings = {
  morningEnabled: true,
  eveningEnabled: true,
  usePrayerTiming: true,
  notificationsGranted: false,
  lastMorningPrompt: null,
  lastEveningPrompt: null,
};

export const DEFAULT_QUICK_LOG_ENGAGEMENT: QuickLogEngagement = {
  acceptanceRate: 0,
  daysWithQuickLog: 0,
  totalSuggestions: 0,
  acceptedSuggestions: 0,
};
