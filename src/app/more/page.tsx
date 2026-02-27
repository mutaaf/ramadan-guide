"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { AISettingsModal } from "@/components/ai/AISettingsModal";
import { CloudSyncModal } from "@/components/sync/CloudSyncModal";
import { CharitySection } from "@/components/CharitySection";
import { useStore } from "@/store/useStore";
import { AICache } from "@/lib/ai/cache";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { isSupabaseConfigured, getSupabaseBrowserClient } from "@/lib/supabase/client";
import { NotificationSettings } from "@/components/NotificationSettings";

const BOOK_PDF_URL = "https://drive.google.com/file/d/14dZVQGAeIvKDSNWyuHHARwkusKmgVue4/view";

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
  const cloudSyncEnabled = useStore((s) => s.cloudSyncEnabled);

  // Open sync modal when redirected from OAuth callback (?sync=setup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncParam = params.get("sync");
    if (syncParam === "setup" || syncParam === "error") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSyncModal(true);
      window.history.replaceState({}, "", "/more");

      if (syncParam === "setup") {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          void (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              useStore.getState().setCloudSyncEnabled(true);
              useStore.getState().setCloudSyncUserId(user.id);
            }
          })();
        }
      }
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

  function confirmClearAllData() {
    localStorage.removeItem("ramadan-guide-storage");
    localStorage.removeItem("ramadan-guide-auth");
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
      <div className="px-6 lg:px-8 pb-8 space-y-2 lg:space-y-3">
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
