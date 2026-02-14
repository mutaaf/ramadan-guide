"use client";

import { motion } from "framer-motion";
import type { BadgeDefinition, BadgeTier } from "@/lib/badges/definitions";

const TIER_COLORS: Record<BadgeTier, { primary: string; bg: string }> = {
  bronze: { primary: "#cd7f32", bg: "rgba(205, 127, 50, 0.15)" },
  silver: { primary: "#d4d4d8", bg: "rgba(212, 212, 216, 0.15)" },
  gold: { primary: "#c9a84c", bg: "rgba(201, 168, 76, 0.2)" },
};

interface BadgeCardListProps {
  badge: BadgeDefinition;
  unlocked: boolean;
  isNew?: boolean;
  onTap?: () => void;
  index?: number;
}

export function BadgeCardList({ badge, unlocked, isNew, onTap, index = 0 }: BadgeCardListProps) {
  const tier = TIER_COLORS[badge.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      <button
        onClick={unlocked ? onTap : undefined}
        className={`relative rounded-2xl p-3 text-left transition-all active:scale-[0.97] w-full${unlocked ? " badge-shimmer" : ""}`}
        style={{
          background: unlocked ? "var(--surface-1)" : "var(--surface-0, var(--background))",
          border: `1px solid ${unlocked ? `${tier.primary}30` : "var(--card-border)"}`,
          opacity: unlocked ? 1 : 0.5,
          cursor: unlocked ? "pointer" : "default",
        }}
      >
        {isNew && (
          <span
            className="absolute -top-1.5 -right-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full animate-pulse"
            style={{ background: "#c9a84c", color: "#000" }}
          >
            New!
          </span>
        )}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
          style={{ background: unlocked ? tier.bg : "var(--surface-2)" }}
        >
          {unlocked ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tier.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          ) : (
            <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>?</span>
          )}
        </div>
        <p className="text-xs font-semibold truncate">{badge.title}</p>
        <p className="text-[10px] truncate" style={{ color: "var(--muted)" }}>
          {badge.subtitle}
        </p>
        <div className="mt-1.5 flex items-center gap-1">
          <span
            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
            style={{
              background: unlocked ? `${tier.primary}20` : "var(--surface-2)",
              color: unlocked ? tier.primary : "var(--muted)",
            }}
          >
            {badge.tier}
          </span>
        </div>
      </button>

      {/* Badge shimmer animation */}
      <style jsx global>{`
        @keyframes badge-shimmer {
          0% { border-color: rgba(201, 168, 76, 0.18); }
          50% { border-color: rgba(201, 168, 76, 0.45); }
          100% { border-color: rgba(201, 168, 76, 0.18); }
        }
        .badge-shimmer {
          animation: badge-shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}
