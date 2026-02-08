"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { getPromptType, getPromptFields } from "@/lib/health/smartDefaults";
import { getTodayString } from "@/lib/ramadan";

interface PrayerTimes {
  fajr?: string;
  maghrib?: string;
}

/**
 * Hook for managing smart health prompts
 *
 * Determines when to show prompts based on:
 * - Time of day (morning after Fajr, evening at Maghrib)
 * - User settings
 * - Already logged data
 */
export function useSmartPrompts(prayerTimes?: PrayerTimes) {
  const {
    smartPromptSettings,
    updateSmartPromptSettings,
    getDay,
  } = useStore();

  const [showPrompt, setShowPrompt] = useState(false);
  const [promptType, setPromptType] = useState<'morning' | 'evening' | null>(null);

  // Convert prayer time strings to hours
  const parseTimeToHour = useCallback((time?: string): number | undefined => {
    if (!time) return undefined;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }, []);

  // Check if we should show prompt
  useEffect(() => {
    const checkPromptTiming = () => {
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const today = getTodayString();
      const todayEntry = getDay(today);

      // Determine prompt type based on time
      const fajrHour = parseTimeToHour(prayerTimes?.fajr);
      const maghribHour = parseTimeToHour(prayerTimes?.maghrib);

      const type = smartPromptSettings.usePrayerTiming
        ? getPromptType(currentHour, fajrHour, maghribHour)
        : getPromptType(currentHour);

      if (!type) {
        setShowPrompt(false);
        setPromptType(null);
        return;
      }

      // Check if prompt is enabled
      const isEnabled = type === 'morning'
        ? smartPromptSettings.morningEnabled
        : smartPromptSettings.eveningEnabled;

      if (!isEnabled) {
        setShowPrompt(false);
        return;
      }

      // Check if we already prompted today
      const lastPromptTime = type === 'morning'
        ? smartPromptSettings.lastMorningPrompt
        : smartPromptSettings.lastEveningPrompt;

      if (lastPromptTime) {
        const lastPromptDate = new Date(lastPromptTime).toDateString();
        if (lastPromptDate === now.toDateString()) {
          // Already prompted today
          setShowPrompt(false);
          return;
        }
      }

      // Check if user already logged the relevant data
      const fieldsToPrompt = getPromptFields(type);
      const hasUnloggedFields = fieldsToPrompt.some(field => {
        switch (field) {
          case 'hoursOfSleep':
            return todayEntry.hoursOfSleep === 0;
          case 'glassesOfWater':
            return todayEntry.glassesOfWater === 0;
          case 'feelsRested':
            return todayEntry.hoursOfSleep === 0; // Only if sleep not logged
          case 'urineColor':
            return todayEntry.urineColor === 1; // Default value
          case 'napMinutes':
            return todayEntry.napMinutes === 0;
          default:
            return false;
        }
      });

      if (hasUnloggedFields) {
        setShowPrompt(true);
        setPromptType(type);
      } else {
        setShowPrompt(false);
        setPromptType(null);
      }
    };

    // Check immediately and every minute
    checkPromptTiming();
    const interval = setInterval(checkPromptTiming, 60000);

    return () => clearInterval(interval);
  }, [
    smartPromptSettings,
    prayerTimes,
    getDay,
    parseTimeToHour,
  ]);

  // Dismiss the prompt
  const dismissPrompt = useCallback(() => {
    const now = Date.now();

    if (promptType === 'morning') {
      updateSmartPromptSettings({ lastMorningPrompt: now });
    } else if (promptType === 'evening') {
      updateSmartPromptSettings({ lastEveningPrompt: now });
    }

    setShowPrompt(false);
    setPromptType(null);
  }, [promptType, updateSmartPromptSettings]);

  // Get fields to show in prompt
  const promptFields = promptType ? getPromptFields(promptType) : [];

  return {
    showPrompt,
    promptType,
    promptFields,
    dismissPrompt,
    settings: smartPromptSettings,
    updateSettings: updateSmartPromptSettings,
  };
}

/**
 * Trigger haptic feedback if supported
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const durations = {
      light: 10,
      medium: 25,
      heavy: 50,
    };
    navigator.vibrate(durations[type]);
  }
}
