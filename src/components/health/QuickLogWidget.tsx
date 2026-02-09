"use client";

import { useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { SleepQuickEntry } from "./SleepQuickEntry";
import { HydrationQuickEntry } from "./HydrationQuickEntry";
import { useStore, createEmptyDay } from "@/store/useStore";
import { useHealthPatterns, useSmartSuggestions, useApplySmartDefault } from "@/hooks/useHealthPatterns";
import { getTodayString } from "@/lib/ramadan";
import { triggerHaptic } from "@/hooks/useSmartPrompts";

type RestedState = 'yes' | 'so-so' | 'no' | null;

/**
 * QuickLogWidget - Main dashboard widget for health data entry
 *
 * Shows smart suggestions based on user patterns with one-tap confirm.
 * Placed after Prayer Widget on the home dashboard.
 */
export function QuickLogWidget() {
  const { patterns } = useHealthPatterns();
  const suggestions = useSmartSuggestions();
  const { applyDefault, dismissSuggestion } = useApplySmartDefault();
  const { days, updateDay } = useStore();

  const today = getTodayString();
  const todayEntry = days[today] ?? createEmptyDay(today);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [restedState, setRestedState] = useState<RestedState>(
    todayEntry.hoursOfSleep > 0
      ? (todayEntry.feelsRested ? 'yes' : 'no')
      : null
  );

  // Check if we have anything to show
  const hasSleepSuggestion = useMemo(() =>
    suggestions.some(s => s.field === 'hoursOfSleep') &&
    !dismissed.has('hoursOfSleep'),
    [suggestions, dismissed]
  );

  const hasHydrationSuggestion = useMemo(() =>
    suggestions.some(s => s.field === 'glassesOfWater') &&
    !dismissed.has('glassesOfWater'),
    [suggestions, dismissed]
  );

  // Get current time for display
  const currentTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  // Show nothing if user has already logged everything
  const shouldShow = hasSleepSuggestion ||
    hasHydrationSuggestion ||
    (todayEntry.hoursOfSleep > 0 && restedState === null);

  const handleSleepAccept = useCallback((hours: number) => {
    applyDefault('hoursOfSleep', hours);
    setDismissed(prev => new Set(prev).add('hoursOfSleep'));
  }, [applyDefault]);

  const handleSleepDismiss = useCallback(() => {
    dismissSuggestion();
    setDismissed(prev => new Set(prev).add('hoursOfSleep'));
  }, [dismissSuggestion]);

  const handleHydrationAccept = useCallback((glasses: number) => {
    applyDefault('glassesOfWater', glasses);
    setDismissed(prev => new Set(prev).add('glassesOfWater'));
  }, [applyDefault]);

  const handleHydrationDismiss = useCallback(() => {
    dismissSuggestion();
    setDismissed(prev => new Set(prev).add('glassesOfWater'));
  }, [dismissSuggestion]);

  const handleRestedSelect = useCallback((state: RestedState) => {
    triggerHaptic('light');
    setRestedState(state);
    const feelsRested = state === 'yes';
    updateDay(today, { feelsRested });
  }, [today, updateDay]);

  if (!shouldShow) {
    return null;
  }

  return (
    <Card className="overflow-hidden" delay={0.1}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Quick Check-in
        </h3>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {currentTime}
        </span>
      </div>

      {/* Entry cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {/* Sleep entry */}
          {hasSleepSuggestion && (
            <SleepQuickEntry
              key="sleep"
              suggestedHours={patterns.typicalSleepHours}
              confidence={patterns.confidence}
              onAccept={handleSleepAccept}
              onDismiss={handleSleepDismiss}
            />
          )}

          {/* Hydration entry */}
          {hasHydrationSuggestion && (
            <HydrationQuickEntry
              key="hydration"
              suggestedGlasses={patterns.typicalGlasses}
              currentGlasses={todayEntry.glassesOfWater}
              confidence={patterns.confidence}
              onAccept={handleHydrationAccept}
              onDismiss={handleHydrationDismiss}
            />
          )}
        </AnimatePresence>

        {/* Rested state buttons - show after sleep is logged */}
        {(todayEntry.hoursOfSleep > 0 || dismissed.has('hoursOfSleep')) && restedState === null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-4"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--card-border)",
            }}
          >
            <p className="text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>
              Feeling rested?
            </p>
            <div className="flex gap-2">
              {[
                { value: 'yes' as const, label: 'Yes', emoji: '😊' },
                { value: 'so-so' as const, label: 'So-so', emoji: '😐' },
                { value: 'no' as const, label: 'No', emoji: '😴' },
              ].map(option => (
                <motion.button
                  key={option.value}
                  onClick={() => handleRestedSelect(option.value)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium"
                  style={{
                    background: restedState === option.value
                      ? "var(--accent-gold)"
                      : "var(--surface-2)",
                    color: restedState === option.value
                      ? "white"
                      : "var(--foreground)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-1.5">{option.emoji}</span>
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Completed state */}
      {!hasSleepSuggestion && !hasHydrationSuggestion && restedState !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-3"
        >
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            ✓ All logged for today
          </span>
        </motion.div>
      )}
    </Card>
  );
}
