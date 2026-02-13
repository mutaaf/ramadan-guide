"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore, createEmptyDay } from "@/store/useStore";
import { getTodayString } from "@/lib/ramadan";
import {
  isConnectedToPartner,
  getConnectionInfo,
  getCachedPartnerStats,
  syncWithPartner,
  disconnectFromPartner,
  buildMySyncData,
  getTimeSinceLastSync,
} from "@/lib/accountability/sync";
import type { PartnerStats } from "@/lib/accountability/types";

export default function PartnerPage() {
  const router = useRouter();
  const { days, setPartnerStats, getPrayerStreak } = useStore();

  const [connected, setConnected] = useState(false);
  const [myCode, setMyCode] = useState("");
  const [partnerCode, setPartnerCode] = useState<string | null>(null);
  const [partnerStats, setLocalPartnerStats] = useState<PartnerStats | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const today = getTodayString();
  const day = days[today] ?? createEmptyDay(today);
  const myPrayerCount = [day.prayers.fajr, day.prayers.dhur, day.prayers.asr, day.prayers.maghrib, day.prayers.ishaa].filter(Boolean).length;
  const myStreak = getPrayerStreak();
  const myHydrationOnTrack = day.glassesOfWater >= 4;

  const doSync = useCallback(async () => {
    if (!isConnectedToPartner()) return;

    setSyncing(true);
    const myStats = buildMySyncData(myPrayerCount, day.glassesOfWater, myStreak);
    const result = await syncWithPartner(myStats);

    if (result.partnerStats) {
      setLocalPartnerStats(result.partnerStats);
      setPartnerStats(result.partnerStats);
    }
    setLastSync(getTimeSinceLastSync());
    setSyncing(false);
  }, [myPrayerCount, day.glassesOfWater, myStreak, setPartnerStats]);

  useEffect(() => {
    const info = getConnectionInfo();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnected(info.connected);
    setMyCode(info.myCode);
    setPartnerCode(info.partnerCode);

    // Load cached stats
    const cached = getCachedPartnerStats();
    if (cached) {
      setLocalPartnerStats(cached);
    }

    setLastSync(getTimeSinceLastSync());

    // Sync if connected
    if (info.connected) {
      doSync();
    }
  }, [doSync]);

  const handleDisconnect = async () => {
    await disconnectFromPartner();
    setPartnerStats(null);
    setConnected(false);
    setPartnerCode(null);
    setLocalPartnerStats(null);
    setShowDisconnectConfirm(false);
  };

  // Not connected - show connect prompt
  if (!connected) {
    return (
      <div>
        <PageHeader
          title="Accountability Partner"
          subtitle="Ramadan together, even when apart"
          back="/more"
        />

        <div className="px-6 pb-8 space-y-6">
          {/* Hero Card */}
          <Card delay={0.05}>
            <div className="text-center py-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(201, 168, 76, 0.15)" }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "var(--accent-gold)" }}
                >
                  <path
                    d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Stay Accountable Together</h2>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Connect with a friend or family member to motivate each other during
                Ramadan. See each other&apos;s progress without sharing personal details.
              </p>
              <Link href="/partner/connect">
                <button
                  className="w-full py-4 rounded-xl text-base font-semibold"
                  style={{ background: "var(--accent-gold)", color: "#000" }}
                >
                  Connect with Partner
                </button>
              </Link>
            </div>
          </Card>

          {/* Benefits */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
              style={{ color: "var(--accent-gold)" }}
            >
              How It Works
            </p>
            <div className="space-y-2">
              {[
                { icon: "1", title: "Share Your Code", desc: "Generate a unique code to share with your partner" },
                { icon: "2", title: "See Progress", desc: "View each other's prayer count, streak, and hydration" },
                { icon: "3", title: "Stay Motivated", desc: "Celebrate wins and support each other" },
              ].map((item, i) => (
                <Card key={item.icon} delay={0.1 + i * 0.05} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: "var(--accent-gold)", color: "#000" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {item.desc}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <Card delay={0.25}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(34, 197, 94, 0.15)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ color: "var(--accent-green)" }}
                >
                  <path
                    d="M8 1.5a3.5 3.5 0 00-3.5 3.5v2h-.5a1 1 0 00-1 1v5a1 1 0 001 1h8a1 1 0 001-1v-5a1 1 0 00-1-1h-.5V5A3.5 3.5 0 008 1.5zM6 5a2 2 0 114 0v2H6V5z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Privacy Protected</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  No names, no personal data. Only aggregate stats are shared. You can
                  disconnect anytime.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Connected - show partner dashboard
  return (
    <div>
      <PageHeader
        title="Your Partner"
        subtitle="Ramadan together"
        back="/more"
      />

      <div className="px-6 pb-8 space-y-6">
        {/* Sync Status */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {lastSync ? `Synced ${lastSync}` : "Not synced yet"}
          </p>
          <button
            onClick={doSync}
            disabled={syncing}
            className="text-xs font-medium"
            style={{ color: "var(--accent-gold)" }}
          >
            {syncing ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {/* Today's Comparison */}
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Today&apos;s Progress
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* My Stats */}
            <Card delay={0.05}>
              <p className="text-xs font-medium mb-3" style={{ color: "var(--muted)" }}>
                You
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Prayers</p>
                  <p className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
                    {myPrayerCount}/5
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Hydration</p>
                  <div
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: myHydrationOnTrack ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: myHydrationOnTrack ? "var(--accent-green)" : "#ef4444",
                    }}
                  >
                    {myHydrationOnTrack ? "On Track" : "Low"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">Streak</p>
                  <p className="text-lg font-bold">{myStreak} days</p>
                </div>
              </div>
            </Card>

            {/* Partner Stats */}
            <Card delay={0.1}>
              <p className="text-xs font-medium mb-3" style={{ color: "var(--muted)" }}>
                Partner
              </p>
              {partnerStats ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Prayers</p>
                    <p className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
                      {partnerStats.prayerCount}/5
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Hydration</p>
                    <div
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: partnerStats.hydrationOnTrack ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: partnerStats.hydrationOnTrack ? "var(--accent-green)" : "#ef4444",
                      }}
                    >
                      {partnerStats.hydrationOnTrack ? "On Track" : "Low"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Streak</p>
                    <p className="text-lg font-bold">{partnerStats.streak} days</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
                    Waiting for partner to sync...
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Celebration/Motivation */}
        {partnerStats && (
          <Card delay={0.15}>
            {partnerStats.prayerCount === 5 && myPrayerCount === 5 ? (
              <div className="text-center py-2">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm font-semibold" style={{ color: "var(--accent-green)" }}>
                  You both completed all prayers today!
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  MashAllah, keep it up!
                </p>
              </div>
            ) : partnerStats.prayerCount === 5 ? (
              <div className="text-center py-2">
                <p className="text-2xl mb-2">🌟</p>
                <p className="text-sm font-semibold">
                  Your partner completed all 5 prayers!
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  You&apos;ve got {5 - myPrayerCount} more to go
                </p>
              </div>
            ) : myPrayerCount === 5 ? (
              <div className="text-center py-2">
                <p className="text-2xl mb-2">✨</p>
                <p className="text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>
                  You completed all 5 prayers!
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Your partner has {partnerStats.prayerCount}/5
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-2xl mb-2">💪</p>
                <p className="text-sm font-semibold">Keep going together!</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  You: {myPrayerCount}/5 • Partner: {partnerStats.prayerCount}/5
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Connection Info */}
        <Card delay={0.2}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
            Connection Info
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">Your Code</p>
              <p className="text-sm font-mono" style={{ color: "var(--accent-gold)" }}>
                {myCode}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Partner Code</p>
              <p className="text-sm font-mono" style={{ color: "var(--accent-gold)" }}>
                {partnerCode}
              </p>
            </div>
          </div>
        </Card>

        {/* Disconnect */}
        <Card delay={0.25} onClick={() => setShowDisconnectConfirm(true)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                Disconnect Partner
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Remove this connection
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ color: "var(--muted)" }}
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "var(--card)" }}
          >
            <h3 className="text-lg font-bold mb-2">Disconnect Partner?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              This will remove the connection. You can always reconnect later with a
              new code.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="py-3 rounded-xl text-sm font-medium"
                style={{ background: "var(--surface-2)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="py-3 rounded-xl text-sm font-medium"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
