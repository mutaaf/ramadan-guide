"use client";

import { useEffect, useState } from "react";
import { HealthPromptSheet } from "./HealthPromptSheet";
import { getPrayerTimes, getCachedLocation } from "@/lib/prayer-times";

/**
 * Client-side provider for the HealthPromptSheet
 *
 * Fetches prayer times and provides them to the prompt sheet.
 * This component should be added to the root layout.
 */
export function HealthPromptProvider() {
  const [prayerTimes, setPrayerTimes] = useState<{
    fajr?: string;
    maghrib?: string;
  }>({});

  useEffect(() => {
    async function loadPrayerTimes() {
      // Try cached location first
      const cached = getCachedLocation();
      if (cached) {
        const times = await getPrayerTimes(cached.latitude, cached.longitude);
        if (times) {
          setPrayerTimes({
            fajr: times.Fajr,
            maghrib: times.Maghrib,
          });
        }
      }
    }

    loadPrayerTimes();

    // Also listen for location updates from the HomeDashboard
    const handleStorageChange = () => {
      loadPrayerTimes();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return <HealthPromptSheet prayerTimes={prayerTimes} />;
}
