"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GeometricPattern } from "@/components/GeometricPattern";
import { HomeDashboard } from "@/components/HomeDashboard";
import { getRamadanCountdown } from "@/lib/ramadan";
import { useStore } from "@/store/useStore";

export default function Home() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(getRamadanCountdown());
  const { days, onboarded } = useStore();
  const [mounted, setMounted] = useState(false);

  // Track hydration and update countdown
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const interval = setInterval(() => {
      setCountdown(getRamadanCountdown());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if user has logged data (returning user)
  const hasData = Object.keys(days).length > 0;
  const isReturningUser = hasData || onboarded;

  // Redirect new users to onboarding
  useEffect(() => {
    if (mounted && !isReturningUser) {
      router.push("/onboarding");
    }
  }, [mounted, isReturningUser, router]);

  // Show dashboard for returning users (after hydration)
  if (mounted && isReturningUser) {
    return <HomeDashboard />;
  }

  // Show loading while checking or redirecting
  if (mounted && !isReturningUser) {
    return null; // Will redirect
  }

  return (
    <div className="relative min-h-dvh flex flex-col">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <GeometricPattern />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(201, 168, 76, 0.08) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 text-center max-w-sm"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm font-medium tracking-widest uppercase mb-8"
            style={{ color: "var(--accent-gold)" }}
          >
            Bismillah
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-4xl font-bold tracking-tight leading-tight"
          >
            Your Personal
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Ramadan Coach
            </span>
            <br />
            <span className="text-xl font-normal" style={{ color: "var(--muted)" }}>
              for Athletes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-4 text-sm"
            style={{ color: "var(--muted)" }}
          >
            With Coach Hamza Abdullah — Retired NFL Player
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 glass-card px-6 py-4 inline-block"
          >
            {countdown.active ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                  Ramadan Day {countdown.dayOfRamadan}
                </p>
                <p className="text-2xl font-bold mt-1">Ramadan Mubarak</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                  Ramadan begins in
                </p>
                <div className="flex items-center gap-4 mt-2 justify-center">
                  <CountdownUnit value={countdown.days} label="Days" />
                  <span className="text-lg font-light" style={{ color: "var(--muted)" }}>:</span>
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <span className="text-lg font-light" style={{ color: "var(--muted)" }}>:</span>
                  <CountdownUnit value={countdown.minutes} label="Min" />
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
              }}
            >
              Start Your Journey
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-6 flex flex-wrap gap-3 justify-center"
          >
            <QuickLink href="/tracker" label="Daily Tracker" />
            <QuickLink href="/prepare/checklist" label="Checklist" />
            <QuickLink href="/dashboard" label="My Progress" />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="px-6 pb-24 pt-4 text-center"
      >
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Based on the book by Hamza Abdullah
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          @ProBigBros &middot; ProBigBros.com
        </p>
      </motion.div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {label}
      </p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2 text-xs font-medium transition-all active:scale-[0.97]"
      style={{
        background: "var(--surface-1)",
        color: "var(--muted)",
      }}
    >
      {label}
    </Link>
  );
}
