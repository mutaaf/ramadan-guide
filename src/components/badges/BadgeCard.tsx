"use client";

import type { BadgeDefinition, BadgeTier } from "@/lib/badges/definitions";
import { StaticGeometricPattern } from "./StaticGeometricPattern";

const TIER_COLORS: Record<BadgeTier, { primary: string; glow: string; bg: string }> = {
  bronze: { primary: "#cd7f32", glow: "rgba(205, 127, 50, 0.3)", bg: "rgba(205, 127, 50, 0.15)" },
  silver: { primary: "#c0c0c0", glow: "rgba(192, 192, 192, 0.3)", bg: "rgba(192, 192, 192, 0.15)" },
  gold: { primary: "#c9a84c", glow: "rgba(201, 168, 76, 0.4)", bg: "rgba(201, 168, 76, 0.2)" },
};

const CATEGORY_ICONS: Record<string, string> = {
  journey: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z",
  prayer: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  quran: "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
  fasting: "M12 3a6 6 0 009 9 9 9 0 11-9-9z",
  wellness: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
};

function BadgeIcon({ category, color, size = 40 }: { category: string; color: string; size?: number }) {
  const d = CATEGORY_ICONS[category] || CATEGORY_ICONS.journey;
  // Prayer uses multiple paths (sun-like)
  if (category === "prayer") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d={d} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ── List Mode: Compact card for grid ──

interface ListModeProps {
  badge: BadgeDefinition;
  unlocked: boolean;
  isNew?: boolean;
  onTap?: () => void;
}

export function BadgeCardList({ badge, unlocked, isNew, onTap }: ListModeProps) {
  const tier = TIER_COLORS[badge.tier];

  return (
    <button
      onClick={unlocked ? onTap : undefined}
      className="relative rounded-2xl p-3 text-left transition-all active:scale-[0.97]"
      style={{
        background: unlocked ? "var(--surface-1)" : "var(--surface-0, var(--background))",
        border: `1px solid ${unlocked ? `${tier.primary}30` : "var(--card-border)"}`,
        opacity: unlocked ? 1 : 0.5,
        cursor: unlocked ? "pointer" : "default",
      }}
    >
      {isNew && (
        <span
          className="absolute -top-1.5 -right-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
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
          <BadgeIcon category={badge.category} color={tier.primary} size={22} />
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
  );
}

// ── Share Mode: Full-size card for image capture ──

interface ShareModeProps {
  badge: BadgeDefinition;
  format: "feed" | "story";
}

export function BadgeCardShare({ badge, format }: ShareModeProps) {
  const tier = TIER_COLORS[badge.tier];
  const isFeed = format === "feed";
  const width = 1080;
  const height = isFeed ? 1080 : 1920;

  return (
    <div
      style={{
        width,
        height,
        background: "#1a1a1c",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Geometric background pattern */}
      <StaticGeometricPattern opacity={0.12} />

      {/* Radial glow behind badge */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tier.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Badge content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 80px" }}>
        {/* Badge icon */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            margin: "0 auto 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: tier.bg,
            border: `3px solid ${tier.primary}`,
            boxShadow: badge.tier === "gold" ? `0 0 60px ${tier.glow}` : undefined,
          }}
        >
          <BadgeIcon category={badge.category} color={tier.primary} size={80} />
        </div>

        {/* Tier label */}
        <div
          style={{
            display: "inline-block",
            padding: "8px 24px",
            borderRadius: 999,
            background: `${tier.primary}25`,
            color: tier.primary,
            fontSize: 24,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 32,
          }}
        >
          {badge.tier}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 16px",
            lineHeight: 1.1,
          }}
        >
          {badge.title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {badge.subtitle}
        </p>
      </div>

      {/* Footer branding */}
      <div
        style={{
          position: "absolute",
          bottom: isFeed ? 60 : 100,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.4)",
            letterSpacing: 2,
          }}
        >
          Ramadan Companion
        </p>
      </div>
    </div>
  );
}
