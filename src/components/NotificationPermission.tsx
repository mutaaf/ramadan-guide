"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { scheduleDailyNotifications } from "@/lib/notifications/prayer-scheduler";

interface NotificationPermissionProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPermission({ open, onClose }: NotificationPermissionProps) {
  const [requesting, setRequesting] = useState(false);
  const updateNotificationPreferences = useStore((s) => s.updateNotificationPreferences);
  const notificationPreferences = useStore((s) => s.notificationPreferences);

  const handleEnable = async () => {
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        updateNotificationPreferences({ enabled: true });
        await scheduleDailyNotifications({ ...notificationPreferences, enabled: true });
      }
    } catch {
      // Permission request failed
    }
    setRequesting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-8"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "var(--surface-2)" }} />

            <div className="text-center space-y-3 mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ background: "rgba(201, 168, 76, 0.1)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">Prayer Reminders</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Get notified before each prayer time, sahoor and iftar reminders, and daily check-ins.
              </p>
            </div>

            <button
              onClick={handleEnable}
              disabled={requesting}
              className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
              }}
            >
              {requesting ? "Requesting..." : "Enable Prayer Reminders"}
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm font-medium py-3 mt-2 transition-all active:scale-[0.97]"
              style={{ color: "var(--muted)" }}
            >
              Not Now
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
