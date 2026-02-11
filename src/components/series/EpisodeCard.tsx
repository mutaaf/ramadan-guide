"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Episode } from "@/lib/series/types";

interface EpisodeCardProps {
  episode: Episode;
  delay?: number;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  hasCompanion?: boolean;
}

export function EpisodeCard({
  episode,
  delay = 0,
  isCompleted,
  isBookmarked,
  hasCompanion,
}: EpisodeCardProps) {
  return (
    <Link href={`/learn/series/${episode.seriesId}/${episode.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          background: "var(--card)",
          border: isCompleted ? "1px solid var(--accent-gold)" : "1px solid var(--card-border)",
          boxShadow: "var(--shadow-sm)",
          opacity: isCompleted ? 0.85 : 1,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Episode number */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: isCompleted ? "var(--accent-gold)" : "var(--surface-1)",
              color: isCompleted ? "white" : "var(--accent-gold)",
            }}
          >
            {isCompleted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              episode.episodeNumber
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px] leading-tight">{episode.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {episode.duration}
              </span>
              {hasCompanion && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
                >
                  Guide
                </span>
              )}
            </div>
          </div>

          {/* Bookmark indicator */}
          {isBookmarked && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-gold)" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          )}

          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
