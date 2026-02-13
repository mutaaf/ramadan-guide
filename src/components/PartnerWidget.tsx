"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useStore, createEmptyDay } from "@/store/useStore";
import { getTodayString } from "@/lib/ramadan";
import {
  isConnectedToPartner,
  getCachedPartnerStats,
  syncWithPartner,
  buildMySyncData,
} from "@/lib/accountability/sync";
import type { PartnerStats } from "@/lib/accountability/types";

export function PartnerWidget() {
  const { days, setPartnerStats, getPrayerStreak } = useStore();
  const [connected, setConnected] = useState(false);
  const [partnerStats, setLocalPartnerStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const today = getTodayString();
  const day = days[today] ?? createEmptyDay(today);
  const myPrayerCount = [day.prayers.fajr, day.prayers.dhur, day.prayers.asr, day.prayers.maghrib, day.prayers.ishaa].filter(Boolean).length;
  const myStreak = getPrayerStreak();

  const doSync = useCallback(async () => {
    if (!isConnectedToPartner()) {
      setLoading(false);
      return;
    }

    const myStats = buildMySyncData(myPrayerCount, day.glassesOfWater, myStreak);
    const result = await syncWithPartner(myStats);

    if (result.partnerStats) {
      setLocalPartnerStats(result.partnerStats);
      setPartnerStats(result.partnerStats);
    }
    setLoading(false);
  }, [myPrayerCount, day.glassesOfWater, myStreak, setPartnerStats]);

  useEffect(() => {
    const isConnected = isConnectedToPartner();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnected(isConnected);

    if (isConnected) {
      // Load cached first for instant display
      const cached = getCachedPartnerStats();
      if (cached) {
        setLocalPartnerStats(cached);
      }
      // Then sync in background
      doSync();
    } else {
      setLoading(false);
    }
  }, [doSync]);

  // Don't show widget if not connected
  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Link href="/partner">
          <Card asLink className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(201, 168, 76, 0.12)" }}
            >
              <svg
                width="24"
                height="24"
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
                />
                <path
                  d="M19 8v6M22 11h-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Add Accountability Partner</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Ramadan together, even when apart
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
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Connected - show partner stats
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wider mb-2 px-1"
        style={{ color: "var(--accent-gold)" }}
      >
        Your Partner
      </p>
      <Link href="/partner">
        <Card asLink>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
              />
            </div>
          ) : partnerStats ? (
            <div className="flex items-center gap-4">
              {/* Partner Status Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: partnerStats.prayerCount === 5
                    ? "rgba(34, 197, 94, 0.15)"
                    : "rgba(201, 168, 76, 0.12)",
                }}
              >
                {partnerStats.prayerCount === 5 ? (
                  <span className="text-xl">✓</span>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    <path
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>

              {/* Stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
                      {partnerStats.prayerCount}/5
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                      Prayers
                    </p>
                  </div>
                  <div
                    className="w-px h-8"
                    style={{ background: "var(--surface-2)" }}
                  />
                  <div>
                    <p className="text-lg font-bold">{partnerStats.streak}</p>
                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                      Day Streak
                    </p>
                  </div>
                  <div
                    className="w-px h-8"
                    style={{ background: "var(--surface-2)" }}
                  />
                  <div>
                    <div
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: partnerStats.hydrationOnTrack
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: partnerStats.hydrationOnTrack
                          ? "var(--accent-green)"
                          : "#ef4444",
                      }}
                    >
                      {partnerStats.hydrationOnTrack ? "Hydrated" : "Low"}
                    </div>
                  </div>
                </div>

                {/* Motivation message */}
                {partnerStats.prayerCount === 5 && myPrayerCount === 5 ? (
                  <p className="text-xs mt-1" style={{ color: "var(--accent-green)" }}>
                    You both completed all prayers! 🎉
                  </p>
                ) : partnerStats.prayerCount === 5 ? (
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    Partner completed all prayers today!
                  </p>
                ) : null}
              </div>

              {/* Arrow */}
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
          ) : (
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(201, 168, 76, 0.12)" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "var(--accent-gold)" }}
                >
                  <path
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold">Partner Connected</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Waiting for partner to sync...
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
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
