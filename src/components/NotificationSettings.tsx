"use client";

import { useStore } from "@/store/useStore";
import { scheduleDailyNotifications } from "@/lib/notifications/prayer-scheduler";

export function NotificationSettings() {
  const prefs = useStore((s) => s.notificationPreferences);
  const updatePrefs = useStore((s) => s.updateNotificationPreferences);

  const permissionGranted =
    typeof Notification !== "undefined" && Notification.permission === "granted";
  const permissionDenied =
    typeof Notification !== "undefined" && Notification.permission === "denied";

  const handleToggle = async (key: keyof typeof prefs, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    updatePrefs({ [key]: value });
    await scheduleDailyNotifications(updated);
  };

  const handleRequestPermission = async () => {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      updatePrefs({ enabled: true });
      await scheduleDailyNotifications({ ...prefs, enabled: true });
    }
  };

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
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-6 rounded-full transition-colors shrink-0"
      style={{ background: checked ? "var(--accent-gold)" : "var(--surface-2)" }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full transition-transform bg-white"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}
