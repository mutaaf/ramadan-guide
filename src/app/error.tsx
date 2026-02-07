"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { DailyWisdom } from "@/components/DailyWisdom";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

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
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3">Something Went Wrong</h1>
        <p className="text-base mb-6" style={{ color: "var(--muted)" }}>
          We encountered an unexpected error. Don't worry — your data is safe.
          Please try again.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl font-medium transition-all active:scale-95"
            style={{
              background: "var(--accent-gold)",
              color: "#000",
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 rounded-xl font-medium transition-all active:scale-95"
            style={{
              background: "var(--surface-1)",
              color: "var(--foreground)",
            }}
          >
            Go Home
          </button>
        </div>

        <div className="mt-8">
          <DailyWisdom context="error" variant="simple" />
        </div>
      </motion.div>
    </div>
  );
}
