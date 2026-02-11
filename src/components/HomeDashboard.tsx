"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useStore, createEmptyDay } from "@/store/useStore";
import { getTodayString } from "@/lib/ramadan";
import {
  PrayerTimes,
  getPrayerTimes,
  getNextPrayer,
  formatTime12h,
  getGreeting,
  getCachedLocation,
  setCachedLocation,
} from "@/lib/prayer-times";
import { DailyWisdom } from "@/components/DailyWisdom";
import { AIInsights } from "@/components/ai/AIInsights";
import { QuickLogWidget } from "@/components/health/QuickLogWidget";
import { PartnerWidget } from "@/components/PartnerWidget";
import { WellnessRings } from "@/components/WellnessRings";
import { PrayerToggles } from "@/components/PrayerToggles";

export function HomeDashboard() {
  const { userName, days, juzProgress, getTasbeehTotalForDay, seriesUserData } = useStore();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const today = getTodayString();
  const day = days[today] ?? createEmptyDay(today);
  const dailyPrayerCount = [day.prayers.fajr, day.prayers.dhur, day.prayers.asr, day.prayers.maghrib, day.prayers.ishaa].filter(Boolean).length;
  const juzDone = juzProgress.filter((p) => p === 100).length;
  const tasbeehTotal = getTasbeehTotalForDay(today);

  useEffect(() => {
    async function fetchPrayerTimes() {
      const cached = getCachedLocation();
      if (cached) {
        const times = await getPrayerTimes(cached.latitude, cached.longitude);
        if (times) {
          setPrayerTimes(times);
          setLoading(false);
          return;
        }
      }

      if (!navigator.geolocation) {
        setLocationError(true);
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCachedLocation({ latitude, longitude });
          const times = await getPrayerTimes(latitude, longitude);
          if (times) {
            setPrayerTimes(times);
          } else {
            setLocationError(true);
          }
          setLoading(false);
        },
        () => {
          setLocationError(true);
          setLoading(false);
        }
      );
    }

    fetchPrayerTimes();
  }, []);

  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes) : null;
  const greeting = getGreeting();

  const quickActions = [
    {
      href: "/tracker/journal",
      label: "Journal",
      color: "var(--accent-gold)",
      bg: "var(--selected-gold-bg)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
    {
      href: "/tracker/tasbeeh",
      label: "Tasbeeh",
      color: "var(--accent-teal, #2dd4bf)",
      bg: "rgba(45, 212, 191, 0.12)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3" /><path d="M12 19v3" />
          <path d="M2 12h3" /><path d="M19 12h3" />
        </svg>
      ),
    },
    {
      href: "/tracker/quran",
      label: "Qur'an",
      color: "var(--accent-blue, #60a5fa)",
      bg: "rgba(96, 165, 250, 0.12)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      href: "/ask",
      label: "Ask",
      color: "var(--accent-gold)",
      bg: "var(--selected-gold-bg)",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-dvh pb-24">
      {/* 1. Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-header pb-4"
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {greeting}
        </p>
        <h1 className="text-2xl font-bold mt-0.5">
          Assalamu Alaikum{userName ? `, ${userName}` : ""}
        </h1>
      </motion.div>

      <div className="px-6 space-y-4">
        {/* 2. Next Prayer — compact single-line banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-3">
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
                />
              </div>
            ) : locationError ? (
              <p className="text-sm text-center py-1" style={{ color: "var(--muted)" }}>
                Enable location for prayer times
              </p>
            ) : prayerTimes && nextPrayer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    Next Prayer
                  </span>
                  <span className="font-bold">{nextPrayer.name}</span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>
                    {formatTime12h(nextPrayer.time)}
                  </span>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
                >
                  in {nextPrayer.countdown}
                </span>
              </div>
            ) : null}
          </Card>
        </motion.div>

        {/* 3. Wellness Card — Rings + Prayer Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
              style={{ color: "var(--accent-gold)" }}
            >
              Today&apos;s Wellness
            </p>
            <WellnessRings
              prayers={dailyPrayerCount}
              hydration={day.glassesOfWater}
              dhikr={tasbeehTotal}
              onTap={() => router.push("/tracker")}
            />
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--card-border)" }}>
              <PrayerToggles />
            </div>
          </Card>
        </motion.div>

        {/* 4. Quick Check-in */}
        <QuickLogWidget />

        {/* 5. Quick Actions + Partner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wider mb-2 px-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Quick Actions
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="shrink-0">
                <Card asLink className="flex flex-col items-center py-3 px-5 w-[76px]">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5"
                    style={{ background: action.bg, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <p className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>
                    {action.label}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <PartnerWidget />

        {/* Continue Watching — Series Companion */}
        {seriesUserData.lastViewed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <Link href={`/learn/series/${seriesUserData.lastViewed.seriesId}/${seriesUserData.lastViewed.episodeId}`}>
              <Card asLink className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                    Continue Watching
                  </p>
                  <p className="text-sm font-semibold mt-0.5 truncate">
                    Series Companion
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* 6. AI Insights + Qur'an Progress + Daily Wisdom (merged) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <AIInsights />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            {/* Qur'an Progress */}
            <Link href="/tracker/quran" className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
              >
                {juzDone}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Qur&apos;an Progress</p>
                <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                  {juzDone} of 30 Juz completed
                </p>
                <div
                  className="h-1 rounded-full mt-1.5 overflow-hidden"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(juzDone / 30) * 100}%`,
                      background: "var(--accent-gold)",
                    }}
                  />
                </div>
              </div>
              <svg
                width="14"
                height="14"
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
            </Link>

            {/* Divider */}
            <div className="my-3" style={{ borderTop: "1px solid var(--card-border)" }} />

            {/* Daily Wisdom */}
            <DailyWisdom context="home" labelText="Daily Reminder" />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
