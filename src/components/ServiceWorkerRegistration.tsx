"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { scheduleDailyNotifications } from "@/lib/notifications/prayer-scheduler";

export function ServiceWorkerRegistration() {
  const notificationPreferences = useStore((s) => s.notificationPreferences);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Schedule notifications after SW registration
          void scheduleDailyNotifications(notificationPreferences);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Handle notification click messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NOTIFICATION_CLICK" && event.data.url) {
        window.location.href = event.data.url;
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    // Reschedule notifications when app returns to foreground
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const prefs = useStore.getState().notificationPreferences;
        void scheduleDailyNotifications(prefs);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
