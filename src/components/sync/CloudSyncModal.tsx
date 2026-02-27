"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { getSupabaseBrowserClient, isSupabaseConfigured, clearAuthStorage } from "@/lib/supabase/client";
import { syncEngine } from "@/lib/sync/engine";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toggle } from "@/components/Toggle";
import type { SyncStatusInfo } from "@/lib/sync/types";

interface CloudSyncModalProps {
  open: boolean;
  onClose: () => void;
}

export function CloudSyncModal({ open, onClose }: CloudSyncModalProps) {
  const {
    cloudSyncEnabled,
    cloudSyncUserId,
    setCloudSyncEnabled,
    setCloudSyncUserId,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>(syncEngine.status);
  const [showDeleteDataConfirm, setShowDeleteDataConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  // Subscribe to sync engine status
  useEffect(() => {
    return syncEngine.subscribe(setSyncStatus);
  }, []);

  // Load user email on open
  useEffect(() => {
    if (!open || !cloudSyncEnabled) {
      setUserEmail(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? user?.user_metadata?.email ?? null);
    })();
  }, [open, cloudSyncEnabled]);

  const handleSignIn = useCallback(async (provider: "google" | "apple") => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    syncEngine.stop();
    await supabase.auth.signOut();
    clearAuthStorage();
    setCloudSyncEnabled(false);
    setCloudSyncUserId(null);
    localStorage.removeItem("ramadan-sync-last-push");
    onClose();
  }, [setCloudSyncEnabled, setCloudSyncUserId, onClose]);

  const handleDeleteCloudData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !cloudSyncUserId) return;
    setShowDeleteDataConfirm(false);
    syncEngine.stop();
    await supabase.from("user_data").delete().eq("user_id", cloudSyncUserId);
    localStorage.removeItem("ramadan-sync-last-push");
    // Restart sync if still enabled (will re-upload on next push)
    if (cloudSyncEnabled) {
      syncEngine.start(supabase, cloudSyncUserId);
    }
  }, [cloudSyncUserId, cloudSyncEnabled]);

  const handleDeleteAccount = useCallback(async () => {
    setShowDeleteAccountConfirm(false);
    syncEngine.stop();
    const supabase = getSupabaseBrowserClient();
    try {
      // Get access token to authenticate the server-side deletion
      const { data: { session } } = await (supabase?.auth.getSession() ?? Promise.resolve({ data: { session: null } }));
      const token = session?.access_token;
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete account");
    } catch {
      // Still sign out locally even if server delete fails
    }
    if (supabase) await supabase.auth.signOut();
    clearAuthStorage();
    setCloudSyncEnabled(false);
    setCloudSyncUserId(null);
    localStorage.removeItem("ramadan-sync-last-push");
    onClose();
  }, [setCloudSyncEnabled, setCloudSyncUserId, onClose]);

  const handleSyncNow = useCallback(async () => {
    await syncEngine.syncNow();
  }, []);

  const handleToggleSync = useCallback(async (value: boolean) => {
    if (!value) {
      // Disable sync
      syncEngine.stop();
      setCloudSyncEnabled(false);
    } else if (cloudSyncUserId) {
      // Re-enable sync
      setCloudSyncEnabled(true);
    }
  }, [cloudSyncEnabled, cloudSyncUserId, setCloudSyncEnabled]);

  const configured = isSupabaseConfigured();
  const signedIn = cloudSyncEnabled && cloudSyncUserId;

  function formatRelativeTime(ts: number | null): string {
    if (!ts) return "Never";
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 top-auto z-[61] max-h-[80vh] overflow-y-auto rounded-3xl p-6"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Cloud Sync</h2>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--surface-1)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {!configured ? (
                <div className="text-center py-6">
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Cloud sync is not available. Supabase is not configured.
                  </p>
                </div>
              ) : !signedIn ? (
                /* ── Not signed in ─────────────────────────── */
                <div className="space-y-5">
                  {/* Cloud icon */}
                  <div className="flex justify-center">
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(201, 168, 76, 0.12)" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                      </svg>
                    </div>
                  </div>

                  <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
                    Sync your progress across devices. Your data stays private and secure.
                  </p>

                  {/* Google sign in */}
                  <button
                    onClick={() => handleSignIn("google")}
                    disabled={loading}
                    className="w-full rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    style={{ background: "var(--surface-1)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {loading ? "Signing in..." : "Sign in with Google"}
                  </button>

                  <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
                    Your data remains on your device even without cloud sync.
                  </p>
                </div>
              ) : (
                /* ── Signed in ─────────────────────────────── */
                <div className="space-y-5">
                  {/* Account info */}
                  <div className="rounded-xl p-4" style={{ background: "var(--surface-1)" }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
                      Signed in as
                    </p>
                    <p className="text-sm font-medium">{userEmail ?? "..."}</p>
                  </div>

                  {/* Last synced + Sync Now */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last synced</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {syncStatus.status === "syncing" ? "Syncing..." : formatRelativeTime(syncStatus.lastSyncedAt)}
                      </p>
                    </div>
                    <button
                      onClick={handleSyncNow}
                      disabled={syncStatus.status === "syncing"}
                      className="rounded-xl px-4 py-2 text-xs font-medium"
                      style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
                    >
                      Sync Now
                    </button>
                  </div>

                  {/* Error display */}
                  {syncStatus.error && (
                    <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                      {syncStatus.error}
                    </div>
                  )}

                  {/* Cloud sync toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Cloud sync enabled</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {cloudSyncEnabled ? "Auto-syncing changes" : "Sync paused"}
                      </p>
                    </div>
                    <Toggle
                      checked={cloudSyncEnabled}
                      onChange={handleToggleSync}
                      size="sm"
                    />
                  </div>

                  {/* Divider */}
                  <div className="border-t" style={{ borderColor: "var(--card-border)" }} />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl py-3 text-sm font-medium text-center"
                    style={{ background: "var(--surface-1)" }}
                  >
                    Sign Out
                  </button>

                  {/* Delete Cloud Data */}
                  <button
                    onClick={() => setShowDeleteDataConfirm(true)}
                    className="w-full rounded-xl py-3 text-sm font-medium text-center"
                    style={{ background: "var(--surface-1)", color: "var(--muted)" }}
                  >
                    Delete Cloud Data
                  </button>

                  {/* Delete Account */}
                  <button
                    onClick={() => setShowDeleteAccountConfirm(true)}
                    className="w-full rounded-xl py-3 text-sm font-medium text-center"
                    style={{ color: "#ef4444" }}
                  >
                    Delete Account
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={showDeleteDataConfirm}
        onCancel={() => setShowDeleteDataConfirm(false)}
        onConfirm={handleDeleteCloudData}
        title="Delete Cloud Data?"
        message="This will remove your synced data from the cloud. Your local data and account will be kept."
        confirmLabel="Delete Cloud Data"
        variant="danger"
      />

      <ConfirmDialog
        open={showDeleteAccountConfirm}
        onCancel={() => setShowDeleteAccountConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="This will permanently delete your cloud account and synced data. Your local data will be kept."
        confirmLabel="Delete Account"
        variant="danger"
      />
    </>
  );
}
