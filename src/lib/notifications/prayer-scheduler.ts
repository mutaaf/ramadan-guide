import { scheduleNotification, cancelAllNotifications } from "./scheduler";
import { getCachedLocation, getPrayerTimes } from "@/lib/prayer-times";
import { getPhaseInfo } from "@/lib/ramadan";
import type { NotificationPreferences } from "@/store/useStore";

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "Fajr",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

function parseTimeToday(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export async function scheduleDailyNotifications(
  preferences: NotificationPreferences
): Promise<void> {
  // Clear all existing scheduled notifications
  cancelAllNotifications();

  if (!preferences.enabled) return;

  // Check notification permission
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  const location = getCachedLocation();
  if (!location) return;

  const times = await getPrayerTimes(location.latitude, location.longitude);
  if (!times) return;

  const phase = getPhaseInfo();
  const isRamadan = phase.phase === "ramadan";

  // Prayer reminders: 10min before each prayer
  if (preferences.prayerReminders) {
    for (const [key, name] of Object.entries(PRAYER_NAMES)) {
      const timeStr = times[key as keyof typeof times];
      if (!timeStr) continue;

      const prayerTime = parseTimeToday(timeStr);
      const reminderTime = new Date(prayerTime.getTime() - 10 * 60 * 1000);

      await scheduleNotification({
        id: `prayer-${key}`,
        title: `${name} in 10 minutes`,
        body: `Time to prepare for ${name} prayer`,
        tag: "prayer-reminder",
        scheduledAt: reminderTime,
        url: "/tracker",
      });
    }
  }

  // Fasting reminders (Ramadan only)
  if (preferences.fastingReminders && isRamadan) {
    // Sahoor reminder: 45min before Fajr
    const fajrTime = parseTimeToday(times.Fajr);
    const sahoorTime = new Date(fajrTime.getTime() - 45 * 60 * 1000);

    await scheduleNotification({
      id: "fasting-sahoor",
      title: "Sahoor Time",
      body: "45 minutes until Fajr. Time to eat and hydrate!",
      tag: "fasting-reminder",
      scheduledAt: sahoorTime,
      url: "/tracker/nutrition",
    });

    // Iftar reminder: at Maghrib
    const maghribTime = parseTimeToday(times.Maghrib);

    await scheduleNotification({
      id: "fasting-iftar",
      title: "Iftar Time!",
      body: "Maghrib has entered. Time to break your fast. Bismillah!",
      tag: "fasting-reminder",
      scheduledAt: maghribTime,
      url: "/tracker/nutrition",
    });
  }

  // Daily check-in: 9 PM
  if (preferences.dailyCheckIn) {
    const checkInTime = new Date();
    checkInTime.setHours(21, 0, 0, 0);

    await scheduleNotification({
      id: "daily-checkin",
      title: "Evening Reflection",
      body: "Take a moment to log your day and reflect on your blessings",
      tag: "daily-checkin",
      scheduledAt: checkInTime,
      url: "/tracker/journal",
    });
  }
}
