export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export interface SyncResult {
  action: "uploaded" | "downloaded" | "skipped" | "error";
  timestamp: number;
  error?: string;
}

export interface SyncStatusInfo {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
}

export interface CloudUserData {
  data: SyncableData;
  data_version: number;
  updated_at: string;
}

/** Shape of the data blob stored in Supabase */
export interface SyncableData {
  _localUpdatedAt: number;
  [key: string]: unknown;
}

export const CURRENT_DATA_VERSION = 11;
