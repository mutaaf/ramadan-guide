"use client";

import { motion } from "framer-motion";
import type { ExtractedVerse } from "@/lib/series/types";

interface VerseCardProps {
  verse: ExtractedVerse;
  index: number;
}

export function VerseCard({ verse, index }: VerseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl p-4"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--card-border)",
      }}
    >
      {verse.arabic && (
        <p
          className="text-xl leading-loose text-right font-arabic mb-3"
          dir="rtl"
          style={{ color: "var(--accent-gold)" }}
        >
          {verse.arabic}
        </p>
      )}

      <p className="text-[14px] leading-relaxed italic">&ldquo;{verse.translation}&rdquo;</p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(96, 165, 250, 0.12)", color: "var(--accent-blue, #60a5fa)" }}
        >
          {verse.reference}
        </span>
      </div>

      {verse.context && (
        <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
          {verse.context}
        </p>
      )}
    </motion.div>
  );
}
