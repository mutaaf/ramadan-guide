"use client";

import { motion } from "framer-motion";
import type { ExtractedHadith } from "@/lib/series/types";

interface HadithCardProps {
  hadith: ExtractedHadith;
  index: number;
}

export function HadithCard({ hadith, index }: HadithCardProps) {
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
      <p className="text-[14px] leading-relaxed italic">&ldquo;{hadith.text}&rdquo;</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
        >
          {hadith.source}
        </span>
        {hadith.narrator && (
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>
            Narrated by {hadith.narrator}
          </span>
        )}
      </div>

      {hadith.context && (
        <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
          {hadith.context}
        </p>
      )}
    </motion.div>
  );
}
