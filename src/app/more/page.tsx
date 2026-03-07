"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { AISettingsModal } from "@/components/ai/AISettingsModal";
import { CloudSyncModal } from "@/components/sync/CloudSyncModal";
import { CharitySection } from "@/components/CharitySection";
import { useStore, type SportType } from "@/store/useStore";
import { AICache } from "@/lib/ai/cache";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { isSupabaseConfigured, clearAuthStorage } from "@/lib/supabase/client";
import { NotificationSettings } from "@/components/NotificationSettings";

const BOOK_PDF_URL = "https://drive.google.com/file/d/14dZVQGAeIvKDSNWyuHHARwkusKmgVue4/view";

const SPORTS: { value: SportType; label: string; icon: string }[] = [
  { value: "football", label: "Football", icon: "🏈" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "soccer", label: "Soccer", icon: "⚽" },
  { value: "track", label: "Track & Field", icon: "🏃" },
  { value: "swimming", label: "Swimming", icon: "🏊" },
  { value: "mma", label: "MMA / Combat", icon: "🥊" },
  { value: "other", label: "Other Sport", icon: "💪" },
  { value: "wellness", label: "General Wellness", icon: "🌿" },
];

const sections = [
  { href: "/ask", title: "Ask Coach Hamza", subtitle: "Your personal Ramadan Q&A", icon: "?" },
  { href: "/partner", title: "Accountability Partner", subtitle: "Ramadan together, even when apart", icon: "👥" },
  { href: "/prepare", title: "Prepare", subtitle: "Checklist, transition, duaa", icon: "P" },
  { href: "/more/wellness", title: "Wellness", subtitle: "Health, self-care, mental health", icon: "W" },
  { href: "/more/community", title: "Community", subtitle: "Challenges & accountability", icon: "C" },
  { href: "/more/post-ramadan", title: "Post-Ramadan", subtitle: "Eid, maintenance plan", icon: "E" },
  { href: "/more/not-fasting", title: "Not Fasting?", subtitle: "It's still Ramadan", icon: "N" },
  { href: "/more/about", title: "About", subtitle: "Coach Hamza & credits", icon: "A" },
];

export default function MorePage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSport, setEditSport] = useState<SportType | "">("");
  const cloudSyncEnabled = useStore((s) => s.cloudSyncEnabled);
  const updateUserProfile = useStore((s) => s.updateUserProfile);
  const userProfile = useStore((s) => s.userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userName = useStore((s) => s.userName);
  const storeSport = useStore((s) => s.sport);

  const openEditProfile = () => {
    setEditName(userProfile.userName || userName);
    setEditSport((userProfile.sport || storeSport) as SportType | "");
    setShowEditProfile(true);
  };

  const saveEditProfile = () => {
    updateUserProfile({ userName: editName.trim(), sport: editSport });
    setShowEditProfile(false);
  };

  // Open sync modal when redirected from OAuth callback (?sync=setup or ?sync=error)
  // SyncProvider's onAuthStateChange handles setting the store state automatically.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncParam = params.get("sync");
    if (syncParam === "setup" || syncParam === "error") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSyncModal(true);
      window.history.replaceState({}, "", "/more");
    }
  }, []);

  function handleDownloadData() {
    const state = useStore.getState();
    const { apiKey: _excluded, ...rest } = state;
    const exportData = {
      exportedAt: new Date().toISOString(),
      appName: "Ramadan Companion",
      data: rest,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ramadan-companion-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.appName !== "Ramadan Companion" || !parsed.data) {
          alert("Invalid file. Please select a Ramadan Companion export file.");
          return;
        }
        if (!window.confirm("This will overwrite all your current data with the imported data. Continue?")) {
          return;
        }
        localStorage.setItem(
          "ramadan-guide-storage",
          JSON.stringify({ state: parsed.data, version: 12 })
        );
        window.location.reload();
      } catch {
        alert("Could not read file. Make sure it's a valid JSON export.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  function confirmClearAllData() {
    localStorage.removeItem("ramadan-guide-storage");
    clearAuthStorage();
    AICache.clear();
    localStorage.removeItem("ramadan-partner-code");
    localStorage.removeItem("ramadan-partner-device-id");
    localStorage.removeItem("ramadan-partner-connected-at");
    localStorage.removeItem("ramadan-partner-stats");
    localStorage.removeItem("ramadan-partner-last-sync");
    window.location.reload();
  }

  return (
    <div>
      <PageHeader title="More" subtitle="Resources, wellness, and community" />
      <div className="px-6 lg:px-8 pb-8 flex flex-col gap-3 lg:gap-4">
        {/* AI Settings */}
        <Card delay={0} className="flex items-center gap-4 lg:gap-5" onClick={() => setShowSettings(true)}>
          <div
            className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl text-base font-bold shrink-0"
            style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
          >
            AI
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">AI Settings</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>API key, model, cache</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Card>

        {/* Cloud Sync */}
        {isSupabaseConfigured() && (
          <Card delay={0.02} className="flex items-center gap-4 lg:gap-5" onClick={() => setShowSyncModal(true)}>
            <div
              className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl shrink-0"
              style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[15px]">Cloud Sync</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {cloudSyncEnabled ? "Syncing across devices" : "Sync across all your devices"}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Card>
        )}

        {/* Notification Settings */}
        <Card delay={0.04}>
          <NotificationSettings />
        </Card>

        {/* Edit Profile */}
        <Card delay={0.05} className="flex items-center gap-4 lg:gap-5" onClick={openEditProfile}>
          <div
            className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl shrink-0"
            style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">Edit Profile</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {(userProfile.userName || userName) || "Change your name or sport"}
              {(userProfile.sport || storeSport) ? ` — ${SPORTS.find(s => s.value === (userProfile.sport || storeSport))?.label || ""}` : ""}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Card>

        {/* Download Your Data */}
        <Card delay={0.06} className="flex items-center gap-4 lg:gap-5" onClick={handleDownloadData}>
          <div
            className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl shrink-0"
            style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">Download Your Data</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Export all your progress as JSON</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Card>

        {/* Import Data */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportData}
        />
        <Card delay={0.07} className="flex items-center gap-4 lg:gap-5" onClick={() => fileInputRef.current?.click()}>
          <div
            className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl shrink-0"
            style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">Import Data</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Restore from a JSON export file</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Card>

        {/* Clear All Data */}
        <Card delay={0.08} className="flex items-center gap-4 lg:gap-5" onClick={() => setShowClearConfirm(true)}>
          <div
            className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl shrink-0"
            style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]" style={{ color: "#ef4444" }}>Clear All Data</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Reset app to fresh state</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Card>

        <CharitySection />

        {/* Download Book */}
        <a href={BOOK_PDF_URL} target="_blank" rel="noopener noreferrer">
          <Card delay={0.12} className="flex items-center gap-4 lg:gap-5">
            <div
              className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl shrink-0"
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a)", color: "#000" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[15px]">Download the Book</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Free PDF — the book behind the app</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
              <path d="M4 1l6 7-6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Card>
        </a>

        {sections.map((s, i) => (
          <Link key={s.href} href={s.href}>
            <Card delay={(i + 1) * 0.06} className="flex items-center gap-4 lg:gap-5">
              <div
                className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl text-base font-bold shrink-0"
                style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
              >
                {s.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[15px]">{s.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.subtitle}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Card>
          </Link>
        ))}
      </div>

      <AISettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <CloudSyncModal open={showSyncModal} onClose={() => setShowSyncModal(false)} />

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-lg font-bold">Edit Profile</h2>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2)", color: "var(--foreground)" }}
                placeholder="Your name"
                maxLength={40}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Sport</label>
              <div className="grid grid-cols-2 gap-2">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setEditSport(s.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
                    style={{
                      background: editSport === s.value ? "var(--selected-gold-bg)" : "var(--surface-2)",
                      border: editSport === s.value ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={saveEditProfile}
                disabled={!editName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                style={{ background: "var(--accent-gold)", color: "#000" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={confirmClearAllData}
        title="Clear All Data?"
        message="This will permanently delete all your progress, tracking data, and settings. This cannot be undone."
        confirmLabel="Delete Everything"
        variant="danger"
      />
    </div>
  );
}
