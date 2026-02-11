"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Series, Scholar } from "@/lib/series/types";

interface SeriesCardProps {
  series: Series;
  scholar?: Scholar;
  delay?: number;
  progress?: { completed: number; total: number; percentage: number };
}

export function SeriesCard({ series, scholar, delay = 0, progress }: SeriesCardProps) {
  return (
    <Link href={`/learn/series/${series.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex gap-4">
          {series.thumbnailUrl ? (
            <img
              src={series.thumbnailUrl}
              alt={series.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--surface-1)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-gold)" }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 7h8" />
                <path d="M8 11h6" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] leading-tight">{series.title}</p>
            {scholar && (
              <p className="text-xs mt-0.5" style={{ color: "var(--accent-gold)" }}>
                {scholar.name}
              </p>
            )}
            <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>
              {series.description}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-1" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
            {series.episodeCount} episodes
          </span>
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>
            {series.totalDuration}
          </span>
          {series.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "var(--surface-1)", color: "var(--muted)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        {progress && progress.completed > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium" style={{ color: "var(--accent-gold)" }}>
                {progress.percentage}% complete
              </span>
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%`, background: "var(--accent-gold)" }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
