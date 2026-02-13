"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DailyWisdom } from "@/components/DailyWisdom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md"
      >
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: "var(--surface-1)" }}
        >
          <svg
            className="w-10 h-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--accent-gold)" }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--accent-gold)" }}>
          404
        </h1>
        <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-base mb-6" style={{ color: "var(--muted)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get
          you back on track.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-medium transition-all active:scale-95 text-center"
            style={{
              background: "var(--accent-gold)",
              color: "#000",
            }}
          >
            Go Home
          </Link>
          <Link
            href="/tracker"
            className="px-6 py-3 rounded-xl font-medium transition-all active:scale-95 text-center"
            style={{
              background: "var(--surface-1)",
              color: "var(--foreground)",
            }}
          >
            Daily Tracker
          </Link>
        </div>

        <div className="mt-8">
          <DailyWisdom context="not-found" variant="simple" />
        </div>
      </motion.div>
    </div>
  );
}
