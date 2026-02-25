"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { syncEngine } from "@/lib/sync/engine";
import { useStore } from "@/store/useStore";
import type { SyncStatusInfo } from "@/lib/sync/types";

export function SyncStatusDot() {
  const cloudSyncEnabled = useStore((s) => s.cloudSyncEnabled);
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>(syncEngine.status);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStatusChange = useCallback((info: SyncStatusInfo) => {
    setSyncStatus(info);
    if (info.status === "syncing") {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
    } else if (info.status === "idle") {
      hideTimer.current = setTimeout(() => setVisible(false), 1000);
    } else {
      // error or offline — stay visible
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    return syncEngine.subscribe(handleStatusChange);
  }, [handleStatusChange]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!cloudSyncEnabled) return null;
  if (!visible) return null;

  let color = "var(--accent-gold)"; // syncing
  if (syncStatus.status === "error") color = "#ef4444";
  if (syncStatus.status === "offline") color = "#f97316";

  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{
        backgroundColor: color,
        animation: syncStatus.status === "syncing" ? "spin 1s linear infinite" : undefined,
      }}
    />
  );
}
