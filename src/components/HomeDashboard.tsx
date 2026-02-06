"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";
import { getTodayString } from "@/lib/ramadan";
import {
  PrayerTimes,
  getPrayerTimes,
  getNextPrayer,
  getCurrentPrayer,
  formatTime12h,
  getGreeting,
  getCachedLocation,
  setCachedLocation,
} from "@/lib/prayer-times";

export function HomeDashboard() {
  const { userName, getDay, juzProgress, tasbeehCounters, getTasbeehTotalForDay } = useStore();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = getTodayString();
  const day = getDay(today);
  const prayerCount = Object.values(day.prayers).filter(Boolean).length;
  const juzDone = juzProgress.filter((p) => p === 100).length;
  const tasbeehTotal = getTasbeehTotalForDay(today);

  useEffect(() => {
    async function fetchPrayerTimes() {
      // Check cached location first
      const cached = getCachedLocation();
      if (cached) {
        const times = await getPrayerTimes(cached.latitude, cached.longitude);
        if (times) {
          setPrayerTimes(times);
          setLoading(false);
          return;
        }
      }

      // Request geolocation
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
  const currentPrayer = prayerTimes ? getCurrentPrayer(prayerTimes) : null;
  const greeting = getGreeting();

  const quickActions = [
    { href: "/tracker/journal", label: "Journal", icon: "J" },
    { href: "/tracker/tasbeeh", label: "Tasbeeh", icon: "T" },
    { href: "/tracker/quran", label: "Qur'an", icon: "Q" },
    { href: "/ask", label: "Ask", icon: "?" },
  ];

  return (
    <div className="min-h-dvh pb-24">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-6 pb-4"
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {greeting}
        </p>
        <h1 className="text-2xl font-bold mt-0.5">
          Assalamu Alaikum{userName ? `, ${userName}` : ""}
        </h1>
      </motion.div>

      <div className="px-6 space-y-4">
        {/* Prayer Widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div
                  className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
                />
              </div>
            ) : locationError ? (
              <div className="text-center py-4">
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Enable location for prayer times
                </p>
              </div>
            ) : prayerTimes && nextPrayer ? (
              <>
                {/* Next Prayer Highlight */}
                <div
                  className="px-4 py-3 -mx-4 -mt-4 mb-3"
                  style={{ background: "var(--selected-gold-bg)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--accent-gold)" }}
                      >
                        Next Prayer
                      </p>
                      <p className="text-xl font-bold mt-0.5">{nextPrayer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>
                        {formatTime12h(nextPrayer.time)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        in {nextPrayer.countdown}
                      </p>
                    </div>
                  </div>
                </div>

                {/* All Prayer Times */}
                <div className="grid grid-cols-5 gap-1">
                  {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map((prayer) => {
                    const isCurrent = prayer === currentPrayer;
                    const isNext = prayer === nextPrayer.name;
                    return (
                      <div
                        key={prayer}
                        className="text-center py-2 rounded-lg"
                        style={{
                          background: isCurrent ? "var(--selected-gold-bg)" : "transparent",
                        }}
                      >
                        <p
                          className="text-[10px] font-medium uppercase"
                          style={{
                            color: isCurrent || isNext ? "var(--accent-gold)" : "var(--muted)",
                          }}
                        >
                          {prayer}
                        </p>
                        <p
                          className="text-xs font-semibold mt-0.5"
                          style={{
                            color: isCurrent ? "var(--foreground)" : "var(--muted)",
                          }}
                        >
                          {formatTime12h(prayerTimes[prayer])}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </Card>
        </motion.div>

        {/* Today's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wider mb-2 px-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Today&apos;s Progress
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/tracker/journal">
              <Card className="text-center py-3">
                <p className="text-2xl font-bold">{prayerCount}/6</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                  Prayers
                </p>
              </Card>
            </Link>
            <Link href="/tracker/hydration">
              <Card className="text-center py-3">
                <p className="text-2xl font-bold">{day.glassesOfWater}/8</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                  Glasses
                </p>
              </Card>
            </Link>
            <Link href="/tracker/tasbeeh">
              <Card className="text-center py-3">
                <p className="text-2xl font-bold">{tasbeehTotal}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                  Dhikr
                </p>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wider mb-2 px-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Quick Actions
          </p>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="flex flex-col items-center py-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-1"
                    style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
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

        {/* Qur'an Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/tracker/quran">
            <Card className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
                style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
              >
                {juzDone}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Qur&apos;an Progress</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {juzDone} of 30 Juz completed
                </p>
                {/* Progress bar */}
                <div
                  className="h-1 rounded-full mt-2 overflow-hidden"
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

        {/* Daily Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: "var(--accent-gold)" }}
            >
              Daily Reminder
            </p>
            <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
              &ldquo;When Ramadan begins, the gates of Paradise are opened, the gates of Hell are
              closed, and the devils are chained.&rdquo;
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              — Sahih al-Bukhari
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
