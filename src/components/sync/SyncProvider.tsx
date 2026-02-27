"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { syncEngine } from "@/lib/sync/engine";

/**
 * Root-level component that starts/stops the sync engine
 * based on auth state and cloudSyncEnabled flag.
 */
export function SyncProvider() {
  const cloudSyncEnabled = useStore((s) => s.cloudSyncEnabled);
  const cloudSyncUserId = useStore((s) => s.cloudSyncUserId);
  const started = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (!cloudSyncEnabled || !cloudSyncUserId) {
      if (started.current) {
        syncEngine.stop();
        started.current = false;
      }
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // Verify session then start engine
    let cancelled = false;

    void (async () => {
      let { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      // If session is null, try refreshing before giving up
      if (!session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (cancelled) return;
        session = refreshData.session;
      }

      if (!session) {
        // Session truly expired — clear sync state
        useStore.getState().setCloudSyncEnabled(false);
        useStore.getState().setCloudSyncUserId(null);
        return;
      }

      syncEngine.start(supabase, session.user.id);
      started.current = true;
    })();

    return () => {
      cancelled = true;
      if (started.current) {
        syncEngine.stop();
        started.current = false;
      }
    };
  }, [cloudSyncEnabled, cloudSyncUserId]);

  return null;
}
