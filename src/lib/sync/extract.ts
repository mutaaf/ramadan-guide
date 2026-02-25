import type { SyncableData } from "./types";

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
 */
export function applySyncedState(
  cloudData: SyncableData
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of SYNC_FIELDS) {
    if (key in cloudData) {
      patch[key] = cloudData[key];
    }
  }
  return patch;
}
