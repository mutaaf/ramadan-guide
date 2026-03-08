interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  tag: string;
  scheduledAt: Date;
  url?: string;
}

interface StoredNotification {
  id: string;
  title: string;
  body: string;
  tag: string;
  scheduledAt: number; // timestamp
  url?: string;
}

const STORAGE_KEY = "scheduled-notifications";
const DELIVERED_KEY = "delivered-notifications";
const CHECK_INTERVAL = 30_000; // 30 seconds
const CATCHUP_WINDOW = 30 * 60 * 1000; // 30 minutes — fire missed notifications within this window

let checkTimer: ReturnType<typeof setInterval> | null = null;

function getStoredNotifications(): StoredNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStoredNotifications(notifications: StoredNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

function getDeliveredToday(): Set<string> {
  try {
    const raw = localStorage.getItem(DELIVERED_KEY);
    if (!raw) return new Set();
    const data = JSON.parse(raw);
    const today = new Date().toDateString();
    // Reset delivered set if it's from a different day
    if (data.date !== today) return new Set();
    return new Set(data.ids);
  } catch {
    return new Set();
  }
}

function markDelivered(id: string): void {
  try {
    const delivered = getDeliveredToday();
    delivered.add(id);
    localStorage.setItem(
      DELIVERED_KEY,
      JSON.stringify({ date: new Date().toDateString(), ids: Array.from(delivered) })
    );
  } catch {
    // ignore
  }
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    // Timeout after 3 seconds to prevent hanging on iOS
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((r) => setTimeout(() => r(null), 3000)),
    ]);
  } catch {
    return null;
  }
}

async function fireNotification(notification: StoredNotification): Promise<boolean> {
  const registration = await getRegistration();
  if (!registration) return false;

  try {
    await registration.showNotification(notification.title, {
      body: notification.body,
      tag: notification.tag,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: { url: notification.url || "/" },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check for due/missed notifications and fire them.
 * Called every 30s and on visibility change.
 */
export async function checkAndFireNotifications(): Promise<void> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  const now = Date.now();
  const notifications = getStoredNotifications();
  const delivered = getDeliveredToday();
  let changed = false;

  for (const notification of notifications) {
    if (delivered.has(notification.id)) continue;

    const scheduledTime = notification.scheduledAt;

    // Not yet due
    if (scheduledTime > now) continue;

    // Due or missed within catch-up window
    const missedBy = now - scheduledTime;
    if (missedBy <= CATCHUP_WINDOW) {
      const success = await fireNotification(notification);
      if (success) {
        markDelivered(notification.id);
        changed = true;
      }
    } else {
      // Too old, mark as delivered to skip it
      markDelivered(notification.id);
      changed = true;
    }
  }

  // Clean up past notifications from storage
  if (changed) {
    const updatedDelivered = getDeliveredToday();
    const remaining = notifications.filter((n) => !updatedDelivered.has(n.id));
    setStoredNotifications(remaining);
  }
}

export async function scheduleNotification(notification: ScheduledNotification): Promise<void> {
  const now = Date.now();
  const scheduledTime = notification.scheduledAt.getTime();

  // Skip if too far in the past (beyond catch-up window)
  if (scheduledTime < now - CATCHUP_WINDOW) return;

  const notifications = getStoredNotifications();

  // Remove existing notification with same id
  const filtered = notifications.filter((n) => n.id !== notification.id);

  filtered.push({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    tag: notification.tag,
    scheduledAt: scheduledTime,
    url: notification.url,
  });

  setStoredNotifications(filtered);

  // If already due, fire immediately
  if (scheduledTime <= now) {
    await checkAndFireNotifications();
  }
}

export function cancelNotification(id: string): void {
  const notifications = getStoredNotifications();
  setStoredNotifications(notifications.filter((n) => n.id !== id));
}

export function cancelAllNotifications(): void {
  setStoredNotifications([]);
}

/**
 * Start the periodic check for due notifications.
 * Should be called once on app mount.
 */
export function startNotificationChecker(): void {
  if (checkTimer) return;
  checkTimer = setInterval(() => {
    void checkAndFireNotifications();
  }, CHECK_INTERVAL);
  // Also check immediately
  void checkAndFireNotifications();
}

/**
 * Stop the periodic checker (cleanup).
 */
export function stopNotificationChecker(): void {
  if (checkTimer) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
}
