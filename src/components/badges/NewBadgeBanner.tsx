"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { evaluateBadges } from "@/lib/badges/evaluate";

export function NewBadgeBanner() {
  const store = useStore();
  const [newBadge, setNewBadge] = useState<{ title: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unlocked = evaluateBadges(useStore.getState());
    const firstNew = unlocked.find((b) => b.isNew);
    if (firstNew) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewBadge({ title: firstNew.definition.title });
    }
  // Re-evaluate when key state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.days, store.juzProgress, store.onboarded, store.seriesUserData, store.tasbeehHistory]);

  if (!newBadge || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, scale: [1, 1.01, 1] }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
        }}
      >
        <Link href="/dashboard/badges">
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3 banner-shimmer"
            style={{
              background: "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(201, 168, 76, 0.25)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(201, 168, 76, 0.2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>
                New Badge Unlocked!
              </p>
              <p className="text-sm font-bold truncate">{newBadge.title}</p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDismissed(true);
              }}
              className="p-1 rounded-full shrink-0"
              style={{ color: "var(--muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </Link>

        {/* Banner shimmer animation */}
        <style jsx global>{`
          @keyframes banner-shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .banner-shimmer {
            background-image: linear-gradient(
              90deg,
              rgba(201, 168, 76, 0.1) 0%,
              rgba(201, 168, 76, 0.1) 40%,
              rgba(232, 199, 90, 0.25) 50%,
              rgba(201, 168, 76, 0.1) 60%,
              rgba(201, 168, 76, 0.1) 100%
            ) !important;
            background-size: 200% 100%;
            animation: banner-shimmer 3s linear infinite;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
