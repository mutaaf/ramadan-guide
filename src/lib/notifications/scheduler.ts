interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  tag: string;
  scheduledAt: Date;
  url?: string;
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.ready;
}

export async function scheduleNotification(notification: ScheduledNotification): Promise<void> {
  // Cancel any existing timer with the same id
  cancelNotification(notification.id);

  const now = Date.now();
  const delay = notification.scheduledAt.getTime() - now;

  // Skip if the time has already passed
  if (delay < 0) return;

  const timer = setTimeout(async () => {
    timers.delete(notification.id);
    const registration = await getRegistration();
    if (!registration) return;

    try {
      await registration.showNotification(notification.title, {
        body: notification.body,
        tag: notification.tag,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: { url: notification.url || "/" },
      });
    } catch {
      // Notification permission may have been revoked
    }
  }, delay);

  timers.set(notification.id, timer);
}

export function cancelNotification(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

export function cancelAllNotifications(): void {
  for (const [id, timer] of timers) {
    clearTimeout(timer);
    timers.delete(id);
  }
}
