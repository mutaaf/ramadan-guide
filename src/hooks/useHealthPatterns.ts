"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { computeHealthPatterns, computeHealthMetrics, isPatternsStale } from "@/lib/health/patternDetector";
import { generateSmartSuggestions } from "@/lib/health/smartDefaults";
import { getTodayString } from "@/lib/ramadan";
import type { QuickLogEntry } from "@/lib/health/types";

/**
 * Hook for accessing and managing health patterns
 *
 * Automatically recomputes patterns when they become stale (>1 hour)
 * or when the user has new data.
 */
export function useHealthPatterns() {
  const {
    days,
    healthPatterns,
    updateHealthPatterns,
    quickLogEngagement,
  } = useStore();

  // Recompute patterns if stale
  useEffect(() => {
    if (isPatternsStale(healthPatterns)) {
      const newPatterns = computeHealthPatterns(days);
      updateHealthPatterns(newPatterns);
    }
  }, [days, healthPatterns, updateHealthPatterns]);

  // Compute derived metrics
  const healthMetrics = useMemo(() => {
    return computeHealthMetrics(days, healthPatterns);
  }, [days, healthPatterns]);

  // Force recompute patterns
  const refreshPatterns = useCallback(() => {
    const newPatterns = computeHealthPatterns(days);
    updateHealthPatterns(newPatterns);
    return newPatterns;
  }, [days, updateHealthPatterns]);

  return {
    patterns: healthPatterns,
    metrics: healthMetrics,
    engagement: quickLogEngagement,
    refreshPatterns,
    isStale: isPatternsStale(healthPatterns),
  };
}

/**
 * Hook for generating smart suggestions for today's entry
 */
export function useSmartSuggestions(): QuickLogEntry[] {
  const { days, getDay, healthPatterns, entrySources } = useStore();
  const today = getTodayString();
  const todayEntry = getDay(today);

  return useMemo(() => {
    // Recompute patterns if needed
    const patterns = isPatternsStale(healthPatterns)
      ? computeHealthPatterns(days)
      : healthPatterns;

    const todaySources = entrySources[today] || {};

    return generateSmartSuggestions(
      patterns,
      {
        hoursOfSleep: todayEntry.hoursOfSleep,
        glassesOfWater: todayEntry.glassesOfWater,
        feelsRested: todayEntry.feelsRested,
        urineColor: todayEntry.urineColor,
        napMinutes: todayEntry.napMinutes,
      },
      todaySources
    );
  }, [days, healthPatterns, todayEntry, entrySources, today]);
}

/**
 * Hook for applying smart defaults
 */
export function useApplySmartDefault() {
  const { updateDay, setEntrySource, recordQuickLogAcceptance } = useStore();
  const today = getTodayString();

  const applyDefault = useCallback((
    field: 'hoursOfSleep' | 'glassesOfWater' | 'feelsRested' | 'urineColor' | 'napMinutes',
    value: number | boolean
  ) => {
    updateDay(today, { [field]: value });
    setEntrySource(today, field, 'quick-log');
    recordQuickLogAcceptance(true);
  }, [today, updateDay, setEntrySource, recordQuickLogAcceptance]);

  const dismissSuggestion = useCallback(() => {
    recordQuickLogAcceptance(false);
  }, [recordQuickLogAcceptance]);

  return {
    applyDefault,
    dismissSuggestion,
  };
}
