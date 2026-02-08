/**
 * Smart Defaults Generator
 *
 * Creates suggestions with confidence levels based on detected patterns.
 * Never overwrites manual entries - only suggests when fields are empty/zero.
 */

import type { HealthPatterns, QuickLogEntry } from './types';

interface CurrentDayData {
  hoursOfSleep: number;
  glassesOfWater: number;
  feelsRested: boolean;
  urineColor: number;
  napMinutes: number;
}

interface EntrySource {
  field: string;
  source: 'manual' | 'voice-journal' | 'quick-log' | 'smart-default' | 'empty';
}

/**
 * Determines if a field is empty/default and can receive a smart suggestion
 */
export function isFieldEmpty(
  field: keyof CurrentDayData,
  value: number | boolean
): boolean {
  switch (field) {
    case 'hoursOfSleep':
    case 'glassesOfWater':
    case 'urineColor':
    case 'napMinutes':
      return value === 0;
    case 'feelsRested':
      // For booleans, we check if sleep was logged
      return false; // Always allow toggle
    default:
      return false;
  }
}

/**
 * Generates smart suggestions based on patterns
 */
export function generateSmartSuggestions(
  patterns: HealthPatterns,
  currentData: CurrentDayData,
  sources?: Record<string, EntrySource['source']>
): QuickLogEntry[] {
  const suggestions: QuickLogEntry[] = [];
  const now = Date.now();

  // Sleep hours suggestion
  const sleepSource = sources?.hoursOfSleep || 'empty';
  if (currentData.hoursOfSleep === 0 && sleepSource !== 'manual') {
    suggestions.push({
      field: 'hoursOfSleep',
      suggestedValue: {
        value: patterns.typicalSleepHours,
        confidence: patterns.confidence,
        reason: patterns.confidence === 'high'
          ? `You usually sleep ${patterns.typicalSleepHours} hours`
          : patterns.confidence === 'medium'
          ? `Average from ${patterns.dataPointsAnalyzed} days`
          : 'Based on recommended sleep',
        source: 'pattern',
      },
      currentValue: null,
      accepted: false,
      timestamp: now,
    });
  }

  // Hydration suggestion
  const hydrationSource = sources?.glassesOfWater || 'empty';
  if (currentData.glassesOfWater === 0 && hydrationSource !== 'manual') {
    suggestions.push({
      field: 'glassesOfWater',
      suggestedValue: {
        value: patterns.typicalGlasses,
        confidence: patterns.confidence,
        reason: patterns.confidence === 'high'
          ? `You typically drink ${patterns.typicalGlasses} glasses`
          : patterns.confidence === 'medium'
          ? `Average from ${patterns.dataPointsAnalyzed} days`
          : 'Recommended daily intake',
        source: 'pattern',
      },
      currentValue: null,
      accepted: false,
      timestamp: now,
    });
  }

  // Rested state suggestion (only if sleep is being logged)
  if (currentData.hoursOfSleep === 0) {
    suggestions.push({
      field: 'feelsRested',
      suggestedValue: {
        value: patterns.typicalRestedState,
        confidence: patterns.confidence,
        reason: patterns.typicalRestedState
          ? 'You usually feel rested'
          : 'Based on your pattern',
        source: 'pattern',
      },
      currentValue: null,
      accepted: false,
      timestamp: now,
    });
  }

  return suggestions;
}

/**
 * Validates if we should apply a smart default
 * Priority order: manual > voice-journal > quick-log > smart-default
 */
export function shouldApplySmartDefault(
  source: EntrySource['source'],
  existingValue: number | boolean | string
): boolean {
  // Never overwrite manual or voice entries
  if (source === 'manual' || source === 'voice-journal') {
    return false;
  }

  // For quick-log confirmed entries, don't overwrite
  if (source === 'quick-log') {
    return false;
  }

  // For numbers, only apply if zero/empty
  if (typeof existingValue === 'number' && existingValue !== 0) {
    return false;
  }

  // For strings, only apply if empty
  if (typeof existingValue === 'string' && existingValue !== '') {
    return false;
  }

  return true;
}

/**
 * Merge smart defaults with existing data, respecting priority
 */
export function mergeWithSmartDefaults<T extends CurrentDayData>(
  currentData: T,
  suggestions: QuickLogEntry[],
  sources: Record<string, EntrySource['source']>
): T {
  const merged = { ...currentData };

  for (const suggestion of suggestions) {
    if (!suggestion.accepted) continue;

    const field = suggestion.field;
    const source = sources[field] || 'empty';
    const currentValue = currentData[field as keyof CurrentDayData];

    if (shouldApplySmartDefault(source, currentValue)) {
      (merged as Record<string, unknown>)[field] = suggestion.suggestedValue.value;
    }
  }

  return merged;
}

/**
 * Get time-appropriate prompt type
 */
export function getPromptType(
  hour: number,
  fajrHour?: number,
  maghribHour?: number
): 'morning' | 'evening' | null {
  // If we have prayer times, use them
  if (fajrHour !== undefined && maghribHour !== undefined) {
    // Morning prompt: within 30 minutes after Fajr
    if (hour >= fajrHour && hour < fajrHour + 0.5) {
      return 'morning';
    }
    // Evening prompt: within 30 minutes after Maghrib
    if (hour >= maghribHour && hour < maghribHour + 0.5) {
      return 'evening';
    }
    return null;
  }

  // Fallback to fixed times
  // Morning: 5 AM - 8 AM
  if (hour >= 5 && hour < 8) {
    return 'morning';
  }
  // Evening: 6 PM - 9 PM
  if (hour >= 18 && hour < 21) {
    return 'evening';
  }

  return null;
}

/**
 * Get fields to prompt based on time of day
 */
export function getPromptFields(
  promptType: 'morning' | 'evening'
): Array<keyof CurrentDayData> {
  switch (promptType) {
    case 'morning':
      // After Fajr: Sleep, rested, urine color
      return ['hoursOfSleep', 'feelsRested', 'urineColor'];
    case 'evening':
      // At Maghrib: Hydration total, nap
      return ['glassesOfWater', 'napMinutes'];
  }
}
