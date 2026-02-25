import type { SupabaseClient } from "@supabase/supabase-js";
import { useStore } from "@/store/useStore";
import { extractSyncableState, applySyncedState } from "./extract";
import type { SyncStatusInfo, SyncableData } from "./types";
import { CURRENT_DATA_VERSION } from "./types";

const DEBOUNCE_MS = 2_000;
const FLUSH_INTERVAL_MS = 60_000;
const LAST_PUSH_KEY = "ramadan-sync-last-push";

type Listener = (info: SyncStatusInfo) => void;

export class CloudSyncEngine {
  private supabase: SupabaseClient | null = null;
  private userId: string | null = null;
  private running = false;

  // Debounce / flush
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  // Snapshot to detect real changes
  private lastSnapshot = "";

  // Status
  private _status: SyncStatusInfo = {
    status: "idle",
    lastSyncedAt: null,
    error: null,
  };

  // Subscribers
  private listeners = new Set<Listener>();

  // Zustand unsubscribe
  private unsubStore: (() => void) | null = null;

  // Event handlers (so we can remove them)
  private handleOnline = () => this.pull();
  private handleOffline = () => this.setStatus("offline", null);
  private handleVisibility = () => {
    if (document.visibilityState === "visible") this.pull();
  };
  private handleBeforeUnload = () => this.flushSync();

  // Backoff
  private backoff = 2_000;

  // ── Public API ──────────────────────────────────────────────────────

  get status(): SyncStatusInfo {
    return this._status;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this._status);
    return () => this.listeners.delete(listener);
  }

  async start(supabase: SupabaseClient, userId: string) {
    if (this.running) this.stop();

    this.supabase = supabase;
    this.userId = userId;
    this.running = true;
    this.backoff = 2_000;

    // Listen for store changes
    this.unsubStore = useStore.subscribe(() => this.schedulePush());

    // Browser events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("beforeunload", this.handleBeforeUnload);

    // Periodic flush
    this.flushTimer = setInterval(() => this.flushSync(), FLUSH_INTERVAL_MS);

    // Initial pull
    await this.pull();
  }

  stop() {
    this.running = false;

    this.unsubStore?.();
    this.unsubStore = null;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.debounceTimer = null;
    this.flushTimer = null;

    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);

    this.supabase = null;
    this.userId = null;
    this.lastSnapshot = "";
    this.setStatus("idle", null);
  }

  /** Force an immediate sync cycle */
  async syncNow() {
    await this.push();
  }

  // ── Internal ────────────────────────────────────────────────────────

  private setStatus(status: SyncStatusInfo["status"], error: string | null) {
    this._status = {
      status,
      lastSyncedAt:
        status === "idle" && !error
          ? Date.now()
          : this._status.lastSyncedAt,
      error,
    };
    for (const fn of this.listeners) fn(this._status);
  }

  private schedulePush() {
    if (!this.running) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.push(), DEBOUNCE_MS);
  }

  private async push() {
    if (!this.running || !this.supabase || !this.userId) return;
    if (!navigator.onLine) {
      this.setStatus("offline", null);
      return;
    }

    const state = useStore.getState() as unknown as Record<string, unknown>;
    const data = extractSyncableState(state);
    const snapshot = JSON.stringify(data);

    // Skip if nothing changed
    if (snapshot === this.lastSnapshot) return;

    this.setStatus("syncing", null);

    try {
      const { error } = await this.supabase.from("user_data").upsert(
        {
          user_id: this.userId,
          data,
          data_version: CURRENT_DATA_VERSION,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      this.lastSnapshot = snapshot;
      localStorage.setItem(LAST_PUSH_KEY, String(data._localUpdatedAt));
      this.backoff = 2_000;
      this.setStatus("idle", null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      this.setStatus("error", msg);
      this.retryWithBackoff(() => this.push());
    }
  }

  async pull() {
    if (!this.running || !this.supabase || !this.userId) return;
    if (!navigator.onLine) {
      this.setStatus("offline", null);
      return;
    }

    this.setStatus("syncing", null);

    try {
      const { data: row, error } = await this.supabase
        .from("user_data")
        .select("data, data_version")
        .eq("user_id", this.userId)
        .maybeSingle();

      if (error) throw error;

      // No cloud data — first time, upload local state
      if (!row) {
        await this.push();
        return;
      }

      // Version guard — cloud has newer app version
      if (row.data_version > CURRENT_DATA_VERSION) {
        this.setStatus("error", "Please update the app to sync");
        return;
      }

      const cloudData = row.data as SyncableData;
      const cloudTs = cloudData._localUpdatedAt ?? 0;
      const localTs = Number(localStorage.getItem(LAST_PUSH_KEY) ?? "0");

      if (cloudTs > localTs) {
        // Cloud is newer → apply to local
        const patch = applySyncedState(cloudData);
        useStore.setState(patch);
        localStorage.setItem(LAST_PUSH_KEY, String(cloudTs));
        // Update our snapshot so push doesn't immediately re-upload
        const freshState = useStore.getState() as unknown as Record<string, unknown>;
        this.lastSnapshot = JSON.stringify(extractSyncableState(freshState));
      }
      // else: local is newer or same, push will happen on next debounce

      this.backoff = 2_000;
      this.setStatus("idle", null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed";
      this.setStatus("error", msg);
      this.retryWithBackoff(() => this.pull());
    }
  }

  /** Synchronous best-effort push (for beforeunload) */
  private flushSync() {
    // Just trigger an async push; beforeunload may not wait for it
    this.push();
  }

  private retryWithBackoff(fn: () => Promise<void>) {
    if (!this.running) return;
    setTimeout(() => {
      if (this.running) fn();
    }, this.backoff);
    this.backoff = Math.min(this.backoff * 2, 60_000);
  }
}

/** Singleton engine instance */
export const syncEngine = new CloudSyncEngine();
