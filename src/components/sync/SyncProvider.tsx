"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { syncEngine } from "@/lib/sync/engine";

/**
 * Root-level component that:
 * 1. Listens for Supabase auth state changes (sign-in, sign-out, token refresh)
 * 2. Auto-restores session on app reopen (PWA or web)
 * 3. Starts/stops the sync engine based on auth + user preference
 */
export function SyncProvider() {
  const cloudSyncEnabled = useStore((s) => s.cloudSyncEnabled);
  const cloudSyncUserId = useStore((s) => s.cloudSyncUserId);
  const started = useRef(false);

  // ── Auth state change listener ──────────────────────────────────────
  // Detects sign-in, sign-out, and token refresh events from Supabase.
  // This is what makes auth persist across web reloads and PWA reopens.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // On mount, check for an existing session (stored in localStorage)
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const store = useStore.getState();
        // Restore sync state if we have a valid session but store lost it
        if (!store.cloudSyncUserId || store.cloudSyncUserId !== session.user.id) {
          store.setCloudSyncUserId(session.user.id);
          store.setCloudSyncEnabled(true);
        }
      }
    })();

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const store = useStore.getState();

        if (event === "SIGNED_IN" && session?.user) {
          // New sign-in — set store state
          if (!store.cloudSyncUserId || store.cloudSyncUserId !== session.user.id) {
            store.setCloudSyncUserId(session.user.id);
            store.setCloudSyncEnabled(true);
          }
        } else if (event === "SIGNED_OUT") {
          // Signed out — clear store state and stop engine
          store.setCloudSyncEnabled(false);
          store.setCloudSyncUserId(null);
          if (started.current) {
            syncEngine.stop();
            started.current = false;
          }
        }
        // TOKEN_REFRESHED is handled automatically by Supabase client
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Sync engine lifecycle ───────────────────────────────────────────
  // Starts/stops the engine based on store state (cloudSyncEnabled + cloudSyncUserId).
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

    // Verify session is valid, then start engine
    let cancelled = false;

    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session) {
        // Try refreshing the token
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (cancelled) return;

        if (!refreshData.session) {
          // Session truly expired — clear sync state
          useStore.getState().setCloudSyncEnabled(false);
          useStore.getState().setCloudSyncUserId(null);
          return;
        }
      }

      const activeSession = session || (await supabase.auth.getSession()).data.session;
      if (!activeSession || cancelled) return;

      syncEngine.start(supabase, activeSession.user.id);
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
