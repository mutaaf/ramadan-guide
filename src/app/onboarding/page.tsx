"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GeometricPattern } from "@/components/GeometricPattern";

export default function OnboardingWelcome() {
  return (
    <div className="relative min-h-[calc(100dvh-3rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
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
          className="text-sm font-medium tracking-widest uppercase mb-6"
          style={{ color: "var(--accent-gold)" }}
        >
          Bismillah
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold mb-6"
          style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
        >
          H
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="text-3xl font-bold tracking-tight mb-3"
        >
          As-Salamu Alaikum
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg mb-2"
          style={{ color: "var(--foreground)" }}
        >
          I&apos;m Coach Hamza
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-sm mb-8"
          style={{ color: "var(--muted)" }}
        >
          Retired NFL Player who fasted during my professional career.
          Let me help you prepare for your best Ramadan yet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="space-y-4"
        >
          <Link
            href="/onboarding/step-1"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
              boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
            }}
          >
            Let&apos;s Get Started
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Takes less than 2 minutes
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
