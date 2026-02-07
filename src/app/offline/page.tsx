"use client";

import { motion } from "framer-motion";

export default function OfflinePage() {
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
            style={{ color: "var(--muted)" }}
          >
            <path d="M1 1l22 22" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3">You're Offline</h1>
        <p className="text-base mb-6" style={{ color: "var(--muted)" }}>
          It looks like you've lost your internet connection. Don't worry — your
          saved data is safe and will sync when you're back online.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl font-medium transition-all active:scale-95"
          style={{
            background: "var(--accent-gold)",
            color: "#000",
          }}
        >
          Try Again
        </button>

        <p className="mt-8 text-sm" style={{ color: "var(--muted)" }}>
          Your Ramadan journey continues even offline. May Allah make it easy
          for you.
        </p>
      </motion.div>
    </div>
  );
}
