export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface NextPrayer {
  name: string;
  time: string;
  countdown: string;
}

const PRAYER_TIMES_CACHE_KEY = "prayer-times-cache";
const LOCATION_CACHE_KEY = "prayer-location-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedPrayerTimes {
  times: PrayerTimes;
  date: string;
  timestamp: number;
}

interface CachedLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

export function getCachedLocation(): CachedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }
  return null;
}

export function setCachedLocation(location: CachedLocation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  } catch {
    // ignore
  }
}

export async function getPrayerTimes(
  latitude: number,
  longitude: number
): Promise<PrayerTimes | null> {
  const today = new Date().toISOString().split("T")[0];

  // Check cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(PRAYER_TIMES_CACHE_KEY);
      if (cached) {
        const data: CachedPrayerTimes = JSON.parse(cached);
        if (data.date === today && Date.now() - data.timestamp < CACHE_DURATION) {
          return data.times;
        }
      }
    } catch {
      // ignore cache errors
    }
  }

  try {
    // Aladhan API - method 2 is Islamic Society of North America (ISNA)
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prayer times");
    }

    const data = await response.json();
    const timings = data.data.timings;

    const prayerTimes: PrayerTimes = {
      Fajr: timings.Fajr,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
    };

    // Cache the result
    if (typeof window !== "undefined") {
      try {
        const cacheData: CachedPrayerTimes = {
          times: prayerTimes,
          date: today,
          timestamp: Date.now(),
        };
        localStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(cacheData));
      } catch {
        // ignore cache errors
      }
    }

    return prayerTimes;
  } catch {
    return null;
  }
}

export function getNextPrayer(times: PrayerTimes): NextPrayer | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: "Fajr", time: times.Fajr },
    { name: "Dhuhr", time: times.Dhuhr },
    { name: "Asr", time: times.Asr },
    { name: "Maghrib", time: times.Maghrib },
    { name: "Isha", time: times.Isha },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerMinutes = hours * 60 + minutes;

    if (prayerMinutes > currentMinutes) {
      const diffMinutes = prayerMinutes - currentMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;

      return {
        name: prayer.name,
        time: prayer.time,
        countdown:
          hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      };
    }
  }

  // After Isha, next prayer is Fajr (tomorrow)
  const [fajrHours, fajrMinutes] = times.Fajr.split(":").map(Number);
  const fajrTotalMinutes = fajrHours * 60 + fajrMinutes;
  const minutesUntilMidnight = 24 * 60 - currentMinutes;
  const diffMinutes = minutesUntilMidnight + fajrTotalMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  return {
    name: "Fajr",
    time: times.Fajr,
    countdown: `${hours}h ${mins}m`,
  };
}

export function getCurrentPrayer(times: PrayerTimes): string | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: "Fajr", time: times.Fajr },
    { name: "Dhuhr", time: times.Dhuhr },
    { name: "Asr", time: times.Asr },
    { name: "Maghrib", time: times.Maghrib },
    { name: "Isha", time: times.Isha },
  ];

  // Find the most recent prayer that has passed
  let currentPrayer: string | null = null;
  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerMinutes = hours * 60 + minutes;

    if (prayerMinutes <= currentMinutes) {
      currentPrayer = prayer.name;
    }
  }

  return currentPrayer;
}

export function formatTime12h(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
