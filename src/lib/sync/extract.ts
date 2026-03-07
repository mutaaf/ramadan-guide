import type { SyncableData } from "./types";
import { useStore } from "@/store/useStore";

/**
 * Record-type fields that need deep merging during cloud sync pull.
 * These are `Record<string, ...>` objects where keys are dates/IDs —
 * shallow replacement would wipe local-only entries.
 */
const DEEP_MERGE_FIELDS = new Set([
  "days",
  "checklist",
  "challengesCompleted",
  "maintenanceDays",
  "tasbeehHistory",
  "badgeUnlocks",
  "seriesUserData",
]);

/**
 * Fields from the Zustand store that get synced to the cloud.
 * Device-specific fields (apiKey, partnerStats, etc.) are excluded.
 */
export const SYNC_FIELDS = [
  "userProfile",
  "userMemory",
  "onboarded",
  "userName",
  "sport",
  "days",
  "juzProgress",
  "tasbeehCounters",
  "tasbeehHistory",
  "healthPatterns",
  "customSchedule",
  "seriesUserData",
  "enabledRings",
  "badgeUnlocks",
  "checklist",
  "challengesCompleted",
  "maintenanceDays",
] as const;

export type SyncField = (typeof SYNC_FIELDS)[number];

/**
 * Extract only the syncable fields from the full Zustand state.
 */
export function extractSyncableState(
  state: Record<string, unknown>
): SyncableData {
  const data: Record<string, unknown> = {
    _localUpdatedAt: Date.now(),
  };
  for (const key of SYNC_FIELDS) {
    if (key in state) {
      data[key] = state[key];
    }
  }
  return data as SyncableData;
}

/**
 * Build a partial state object from cloud data that can be passed
 * to `useStore.setState()`.  Only includes known SYNC_FIELDS.
 *
 * Record-type fields (days, checklist, etc.) are deep-merged so that
 * local-only keys survive while cloud keys win per-entry.
 */
export function applySyncedState(
  cloudData: SyncableData
): Record<string, unknown> {
  const local = useStore.getState() as unknown as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  for (const key of SYNC_FIELDS) {
    if (!(key in cloudData)) continue;

    const cloudVal = cloudData[key as keyof SyncableData];

    if (
      DEEP_MERGE_FIELDS.has(key) &&
      cloudVal &&
      typeof cloudVal === "object" &&
      !Array.isArray(cloudVal)
    ) {
      // Deep merge: local keys preserved, cloud keys win per-entry
      const localVal = (local[key] as Record<string, unknown>) || {};
      patch[key] = { ...localVal, ...cloudVal };
    } else {
      patch[key] = cloudVal;
    }
  }

  return patch;
}
