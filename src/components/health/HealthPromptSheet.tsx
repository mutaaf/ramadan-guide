"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircularSlider } from "@/components/ui/CircularSlider";
import { useStore } from "@/store/useStore";
import { useSmartPrompts, triggerHaptic } from "@/hooks/useSmartPrompts";
import { useHealthPatterns } from "@/hooks/useHealthPatterns";
import { getTodayString } from "@/lib/ramadan";

interface PrayerTimes {
  fajr?: string;
  maghrib?: string;
}

interface HealthPromptSheetProps {
  prayerTimes?: PrayerTimes;
}

// Urine color options (1-8 scale)
const urineColors = [
  { value: 1, color: "#F0F0D8", label: "Clear" },
  { value: 2, color: "#F5F0C8", label: "Pale" },
  { value: 3, color: "#F5E8A0", label: "Light" },
  { value: 4, color: "#E8D078", label: "Yellow" },
  { value: 5, color: "#D4B050", label: "Dark" },
  { value: 6, color: "#C09030", label: "Amber" },
  { value: 7, color: "#A06820", label: "Orange" },
  { value: 8, color: "#804010", label: "Brown" },
];

interface PromptFormProps {
  promptType: 'morning' | 'evening';
  promptFields: Array<'hoursOfSleep' | 'glassesOfWater' | 'feelsRested' | 'urineColor' | 'napMinutes'>;
  initialSleepHours: number;
  initialGlasses: number;
  initialUrineColor: number;
  initialNapMinutes: number;
  onSave: (data: {
    sleepHours: number;
    feelsRested: boolean | null;
    urineColor: number;
    glasses: number;
    napMinutes: number;
  }) => void;
  onDismiss: () => void;
}

/**
 * Form component that gets remounted when the prompt opens
 * This ensures state is always fresh
 */
function PromptForm({
  promptType,
  promptFields,
  initialSleepHours,
  initialGlasses,
  initialUrineColor,
  initialNapMinutes,
  onSave,
  onDismiss,
}: PromptFormProps) {
  const [sleepHours, setSleepHours] = useState(initialSleepHours);
  const [feelsRested, setFeelsRested] = useState<boolean | null>(null);
  const [urineColor, setUrineColor] = useState(initialUrineColor);
  const [glasses, setGlasses] = useState(initialGlasses);
  const [napMinutes, setNapMinutes] = useState(initialNapMinutes);

  const handleSave = useCallback(() => {
    triggerHaptic('medium');
    onSave({ sleepHours, feelsRested, urineColor, glasses, napMinutes });
  }, [sleepHours, feelsRested, urineColor, glasses, napMinutes, onSave]);

  return (
    <div className="px-6 pb-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
          {promptType === 'morning' ? '🌅 Morning Check-in' : '🌙 Evening Check-in'}
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {promptType === 'morning'
            ? 'How did you sleep?'
            : 'How was your hydration today?'}
        </p>
      </div>

      {/* Morning prompts */}
      {promptType === 'morning' && (
        <div className="space-y-6">
          {/* Sleep hours */}
          {promptFields.includes('hoursOfSleep') && (
            <div className="flex flex-col items-center">
              <CircularSlider
                value={sleepHours}
                min={0}
                max={12}
                step={0.5}
                size={160}
                onChange={setSleepHours}
                label="hours of sleep"
                color="var(--accent-blue)"
              />
            </div>
          )}

          {/* Feeling rested */}
          {promptFields.includes('feelsRested') && (
            <div>
              <p className="text-sm font-medium mb-3 text-center" style={{ color: "var(--foreground)" }}>
                Feeling rested?
              </p>
              <div className="flex gap-2 justify-center">
                {[
                  { value: true, label: 'Yes', emoji: '😊' },
                  { value: false, label: 'No', emoji: '😴' },
                ].map(option => (
                  <motion.button
                    key={String(option.value)}
                    onClick={() => setFeelsRested(option.value)}
                    className="flex-1 max-w-[120px] py-3 px-4 rounded-xl text-sm font-medium"
                    style={{
                      background: feelsRested === option.value
                        ? "var(--accent-gold)"
                        : "var(--surface-1)",
                      color: feelsRested === option.value
                        ? "white"
                        : "var(--foreground)",
                      border: "1px solid var(--card-border)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-1.5 text-lg">{option.emoji}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Urine color */}
          {promptFields.includes('urineColor') && (
            <div>
              <p className="text-sm font-medium mb-3 text-center" style={{ color: "var(--foreground)" }}>
                Urine color (hydration check)
              </p>
              <div className="flex gap-1.5 justify-center flex-wrap">
                {urineColors.map(option => (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      triggerHaptic('light');
                      setUrineColor(option.value);
                    }}
                    className="w-9 h-9 rounded-lg relative"
                    style={{
                      background: option.color,
                      border: urineColor === option.value
                        ? "3px solid var(--accent-gold)"
                        : "1px solid var(--card-border)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    title={option.label}
                  >
                    {urineColor === option.value && (
                      <motion.div
                        layoutId="urine-selected"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          boxShadow: "0 0 0 2px var(--accent-gold)",
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
                {urineColor <= 3 ? "Well hydrated" :
                  urineColor <= 5 ? "Mild dehydration" :
                  "Dehydrated - drink more water"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Evening prompts */}
      {promptType === 'evening' && (
        <div className="space-y-6">
          {/* Hydration */}
          {promptFields.includes('glassesOfWater') && (
            <div>
              <p className="text-sm font-medium mb-3 text-center" style={{ color: "var(--foreground)" }}>
                💧 Glasses of water today
              </p>
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 8 }, (_, i) => {
                  const isFilled = i < glasses;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => {
                        triggerHaptic('light');
                        setGlasses(isFilled ? i : i + 1);
                      }}
                      className="w-8 h-10 rounded-md"
                      style={{
                        background: isFilled
                          ? "var(--accent-blue)"
                          : "var(--surface-2)",
                        border: isFilled
                          ? "none"
                          : "1px dashed var(--card-border)",
                      }}
                      whileTap={{ scale: 0.9 }}
                    />
                  );
                })}
              </div>
              <p className="text-sm text-center mt-2" style={{ color: "var(--accent-blue)" }}>
                {glasses} / 8 glasses
              </p>
            </div>
          )}

          {/* Nap */}
          {promptFields.includes('napMinutes') && (
            <div>
              <p className="text-sm font-medium mb-3 text-center" style={{ color: "var(--foreground)" }}>
                😴 Did you take a nap?
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                {[
                  { value: 0, label: 'No nap' },
                  { value: 15, label: '15 min' },
                  { value: 30, label: '30 min' },
                  { value: 60, label: '1 hour' },
                  { value: 90, label: '1.5 hours' },
                ].map(option => (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      triggerHaptic('light');
                      setNapMinutes(option.value);
                    }}
                    className="py-2 px-3 rounded-lg text-sm"
                    style={{
                      background: napMinutes === option.value
                        ? "var(--accent-gold)"
                        : "var(--surface-1)",
                      color: napMinutes === option.value
                        ? "white"
                        : "var(--foreground)",
                      border: "1px solid var(--card-border)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <motion.button
          onClick={onDismiss}
          className="flex-1 py-3 rounded-xl text-sm font-medium"
          style={{
            background: "var(--surface-1)",
            color: "var(--muted)",
            border: "1px solid var(--card-border)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          Later
        </motion.button>
        <motion.button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: "var(--accent-gold)",
            color: "white",
          }}
          whileTap={{ scale: 0.98 }}
        >
          Save
        </motion.button>
      </div>
    </div>
  );
}

/**
 * Bottom sheet that slides up at prompt times
 *
 * - Morning (Fajr + 15min): Sleep hours, felt rested, urine color
 * - Evening (Maghrib): Hydration total, nap taken
 */
export function HealthPromptSheet({ prayerTimes }: HealthPromptSheetProps) {
  const [formKey, setFormKey] = useState(0);
  const {
    showPrompt,
    promptType,
    promptFields,
    dismissPrompt,
  } = useSmartPrompts(prayerTimes);

  const { patterns } = useHealthPatterns();
  const { getDay, updateDay, setEntrySource, recordQuickLogAcceptance } = useStore();
  const today = getTodayString();
  const todayEntry = getDay(today);

  const handleSave = useCallback((data: {
    sleepHours: number;
    feelsRested: boolean | null;
    urineColor: number;
    glasses: number;
    napMinutes: number;
  }) => {
    if (promptType === 'morning') {
      updateDay(today, {
        hoursOfSleep: data.sleepHours,
        feelsRested: data.feelsRested ?? patterns.typicalRestedState,
        urineColor: data.urineColor,
      });
      setEntrySource(today, 'hoursOfSleep', 'quick-log');
      setEntrySource(today, 'urineColor', 'quick-log');
      recordQuickLogAcceptance(true);
    } else if (promptType === 'evening') {
      updateDay(today, {
        glassesOfWater: data.glasses,
        napMinutes: data.napMinutes,
      });
      setEntrySource(today, 'glassesOfWater', 'quick-log');
      recordQuickLogAcceptance(true);
    }

    dismissPrompt();
  }, [
    promptType,
    today,
    patterns.typicalRestedState,
    updateDay,
    setEntrySource,
    recordQuickLogAcceptance,
    dismissPrompt,
  ]);

  const handleDismiss = useCallback(() => {
    recordQuickLogAcceptance(false);
    dismissPrompt();
    setFormKey(k => k + 1);
  }, [recordQuickLogAcceptance, dismissPrompt]);

  // Increment form key when save completes to reset state for next open
  const handleSaveWrapper = useCallback((data: {
    sleepHours: number;
    feelsRested: boolean | null;
    urineColor: number;
    glasses: number;
    napMinutes: number;
  }) => {
    handleSave(data);
    setFormKey(k => k + 1);
  }, [handleSave]);

  return (
    <AnimatePresence>
      {showPrompt && promptType && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto"
            style={{
              background: "var(--card)",
              paddingBottom: "env(safe-area-inset-bottom, 24px)",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "var(--surface-2)" }}
              />
            </div>

            {/* Form - key ensures fresh state each time */}
            <PromptForm
              key={formKey}
              promptType={promptType}
              promptFields={promptFields}
              initialSleepHours={todayEntry.hoursOfSleep || patterns.typicalSleepHours}
              initialGlasses={todayEntry.glassesOfWater || patterns.typicalGlasses}
              initialUrineColor={todayEntry.urineColor || 4}
              initialNapMinutes={todayEntry.napMinutes || 0}
              onSave={handleSaveWrapper}
              onDismiss={handleDismiss}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
