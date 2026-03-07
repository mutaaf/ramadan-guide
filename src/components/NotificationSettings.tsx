"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { Toggle } from "@/components/Toggle";
import { scheduleDailyNotifications } from "@/lib/notifications/prayer-scheduler";

export function NotificationSettings() {
  const prefs = useStore((s) => s.notificationPreferences);
  const updatePrefs = useStore((s) => s.updateNotificationPreferences);
  const [testSent, setTestSent] = useState(false);

  // Re-read permission each render so toggling/revoking is reflected
  const [permission, setPermission] = useState(() =>
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const permissionGranted = permission === "granted";
  const permissionDenied = permission === "denied";

  const handleToggle = async (key: keyof typeof prefs, value: boolean) => {
    // If enabling and permission isn't granted yet, request it first
    if (key === "enabled" && value && !permissionGranted) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;
    }

    updatePrefs({ [key]: value });
    await scheduleDailyNotifications({ ...prefs, [key]: value });
  };

  const handleRequestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      updatePrefs({ enabled: true });
      await scheduleDailyNotifications({ ...prefs, enabled: true });
    }
  };

  const sendTestNotification = useCallback(async () => {
    try {
      // On iOS PWAs, must use SW showNotification — new Notification() is unsupported
      if ("serviceWorker" in navigator) {
        // Race against a timeout so we don't hang if SW isn't active
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((r) => setTimeout(() => r(null), 3000)),
        ]);
        if (reg) {
          await reg.showNotification("Ramadan Companion", {
            body: "Notifications are working! — Coach Hamza",
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: "test-notification",
          });
          setTestSent(true);
          setTimeout(() => setTestSent(false), 3000);
          return;
        }
      }
      // Fallback for non-iOS browsers without SW
      new Notification("Ramadan Companion", {
        body: "Notifications are working! — Coach Hamza",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch {
      setTestSent(false);
    }
  }, []);

  if (typeof Notification === "undefined") return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {permissionDenied
              ? "Blocked in browser settings"
              : permissionGranted
                ? prefs.enabled ? "Active" : "Paused"
                : "Not enabled"}
          </p>
        </div>
        {!permissionGranted && !permissionDenied && (
          <button
            onClick={handleRequestPermission}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
          >
            Enable
          </button>
        )}
        {permissionGranted && (
          <Toggle
            checked={prefs.enabled}
            onChange={(v) => handleToggle("enabled", v)}
            size="sm"
          />
        )}
      </div>

      {permissionGranted && prefs.enabled && (
        <div className="space-y-3 pl-1">
          <ToggleRow
            label="Prayer reminders"
            description="10 min before each prayer"
            checked={prefs.prayerReminders}
            onChange={(v) => handleToggle("prayerReminders", v)}
          />
          <ToggleRow
            label="Fasting reminders"
            description="Sahoor & Iftar times"
            checked={prefs.fastingReminders}
            onChange={(v) => handleToggle("fastingReminders", v)}
          />
          <ToggleRow
            label="Daily check-in"
            description="Evening journal at 9 PM"
            checked={prefs.dailyCheckIn}
            onChange={(v) => handleToggle("dailyCheckIn", v)}
          />
          <ToggleRow
            label="Badge unlocks"
            description="New achievement alerts"
            checked={prefs.badgeUnlocks}
            onChange={(v) => handleToggle("badgeUnlocks", v)}
          />

          <button
            onClick={sendTestNotification}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: testSent ? "rgba(34,197,94,0.15)" : "rgba(201, 168, 76, 0.12)",
              color: testSent ? "#22c55e" : "var(--accent-gold)",
            }}
          >
            {testSent ? "Sent!" : "Send Test Notification"}
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} size="sm" />
    </div>
  );
}
