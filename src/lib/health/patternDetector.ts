/**
 * Pattern Detector - Analyzes last 14 days of health data
 *
 * Computes typical values for sleep, hydration, and other metrics
 * to generate smart suggestions for the Quick Log widget.
 */

import type { HealthPatterns, HealthMetrics } from './types';
import { DEFAULT_HEALTH_PATTERNS } from './types';
import type { DayEntry } from '@/store/useStore';

/**
 * Computes health patterns from the last 14 days of entries
 */
export function computeHealthPatterns(
  days: Record<string, DayEntry>
): HealthPatterns {
  const entries = Object.values(days);

  // Sort by date descending and take last 14 days
  const sorted = entries
    .filter(d => d.date && typeof d.date === 'string')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  if (sorted.length === 0) {
    return DEFAULT_HEALTH_PATTERNS;
  }

  // Sleep pattern analysis
  const sleepData = sorted.filter(d => d.hoursOfSleep > 0);
  const typicalSleepHours = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.hoursOfSleep, 0) / sleepData.length
    : 7; // Sensible default

  // Calculate sleep variance (standard deviation)
  const sleepVariance = sleepData.length > 1
    ? Math.sqrt(
        sleepData.reduce((sum, d) => sum + Math.pow(d.hoursOfSleep - typicalSleepHours, 2), 0)
        / sleepData.length
      )
    : 1;

  // Rested state analysis (most common response)
  const restedResponses = sorted.filter(d =>
    typeof d.feelsRested === 'boolean' && d.hoursOfSleep > 0
  );
  const typicalRestedState = restedResponses.length > 0
    ? restedResponses.filter(d => d.feelsRested).length > restedResponses.length / 2
    : true;

  // Hydration pattern analysis
  const hydrationData = sorted.filter(d => d.glassesOfWater > 0);
  const typicalGlasses = hydrationData.length > 0
    ? Math.round(
        hydrationData.reduce((sum, d) => sum + d.glassesOfWater, 0) / hydrationData.length
      )
    : 6;

  // Analyze preferred drinks (top 3 by frequency)
  const drinkCounts: Record<string, number> = {};
  sorted.forEach(d => {
    if (d.hydrationDrinks && Array.isArray(d.hydrationDrinks)) {
      d.hydrationDrinks.forEach(drink => {
        drinkCounts[drink] = (drinkCounts[drink] || 0) + 1;
      });
    }
  });
  const preferredDrinks = Object.entries(drinkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([drink]) => drink);

  // Confidence based on data points
  const confidence: HealthPatterns['confidence'] =
    sleepData.length >= 7 ? 'high'
    : sleepData.length >= 3 ? 'medium'
    : 'low';

  return {
    typicalSleepHours: Math.round(typicalSleepHours * 2) / 2, // Round to 0.5
    sleepVariance: Math.round(sleepVariance * 10) / 10,
    typicalRestedState,
    typicalGlasses,
    preferredDrinks,
    lastPatternUpdate: Date.now(),
    dataPointsAnalyzed: sorted.length,
    confidence,
  };
}

/**
 * Computes health metrics for AI insights
 */
export function computeHealthMetrics(
  days: Record<string, DayEntry>,
  patterns: HealthPatterns
): HealthMetrics {
  const entries = Object.values(days);
  const sorted = entries
    .filter(d => d.date && typeof d.date === 'string')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  // Sleep consistency: inverse of variance, scaled to 0-100
  // Low variance = high consistency
  const sleepConsistency = Math.max(0, Math.min(100,
    Math.round(100 - (patterns.sleepVariance * 20))
  ));

  // Hydration trend: compare last 7 days to previous 7 days
  const recentHydration = sorted.slice(0, 7);
  const previousHydration = sorted.slice(7, 14);

  const recentAvg = recentHydration.filter(d => d.glassesOfWater > 0).length > 0
    ? recentHydration.filter(d => d.glassesOfWater > 0)
        .reduce((s, d) => s + d.glassesOfWater, 0) /
        recentHydration.filter(d => d.glassesOfWater > 0).length
    : 0;

  const previousAvg = previousHydration.filter(d => d.glassesOfWater > 0).length > 0
    ? previousHydration.filter(d => d.glassesOfWater > 0)
        .reduce((s, d) => s + d.glassesOfWater, 0) /
        previousHydration.filter(d => d.glassesOfWater > 0).length
    : 0;

  let hydrationTrend: HealthMetrics['hydrationTrend'];
  if (previousAvg === 0) {
    hydrationTrend = 'stable';
  } else if (recentAvg > previousAvg + 0.5) {
    hydrationTrend = 'improving';
  } else if (recentAvg < previousAvg - 0.5) {
    hydrationTrend = 'declining';
  } else {
    hydrationTrend = 'stable';
  }

  // Data completeness: % of last 14 days with at least one health metric
  const daysWithData = sorted.filter(d =>
    d.hoursOfSleep > 0 || d.glassesOfWater > 0
  ).length;
  const dataCompleteness = sorted.length > 0
    ? Math.round((daysWithData / Math.min(14, sorted.length)) * 100)
    : 0;

  return {
    sleepConsistency,
    hydrationTrend,
    dataCompleteness,
  };
}

/**
 * Get confidence message for UI display
 */
export function getConfidenceMessage(confidence: HealthPatterns['confidence']): string {
  switch (confidence) {
    case 'high':
      return 'Based on your pattern';
    case 'medium':
      return "We're learning your pattern";
    case 'low':
      return 'Help us learn - log a few more days';
  }
}

/**
 * Calculate how stale the patterns are
 */
export function isPatternsStale(patterns: HealthPatterns): boolean {
  if (patterns.lastPatternUpdate === 0) return true;

  const oneHour = 60 * 60 * 1000;
  return Date.now() - patterns.lastPatternUpdate > oneHour;
}
