"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { getPhaseInfo } from "@/lib/ramadan";
import {
  ContentContext,
  ContentItem,
  selectContent,
  getContentText,
} from "@/lib/content/content-engine";

interface DailyWisdomProps {
  context: ContentContext;
  variant?: "card" | "inline" | "simple";
  className?: string;
  showLabel?: boolean;
  labelText?: string;
}

export function DailyWisdom({
  context,
  variant = "card",
  className = "",
  showLabel = true,
  labelText,
}: DailyWisdomProps) {
  const { days, juzProgress, userName } = useStore();
  const phaseInfo = getPhaseInfo();
  const { dayOfRamadan } = phaseInfo;

  const content = useMemo((): ContentItem => {
    return selectContent(context, days, juzProgress, dayOfRamadan, userName);
  }, [context, days, juzProgress, dayOfRamadan, userName]);

  const { text, source } = useMemo(() => getContentText(content), [content]);

  // Determine label based on content type
  const defaultLabel = useMemo(() => {
    if (content.type === "hadith") return "Daily Reminder";
    if (content.type === "verse") return "From the Qur'an";
    return "Daily Wisdom";
  }, [content.type]);

  const label = labelText ?? defaultLabel;

  if (variant === "simple") {
    return (
      <div className={className}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          &ldquo;{text}&rdquo; — {source}
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={className}>
        <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
          &ldquo;{text}&rdquo;
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
          — {source}
        </p>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={className}>
      {showLabel && (
        <p
          className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: "var(--accent-gold)" }}
        >
          {label}
        </p>
      )}
      <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
        &ldquo;{text}&rdquo;
      </p>
      <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
        — {source}
      </p>
    </div>
  );
}

// Convenience components for common use cases
export function DailyHadith({ className = "" }: { className?: string }) {
  return <DailyWisdom context="home" className={className} labelText="Daily Reminder" />;
}

export function DailyVerse({ className = "" }: { className?: string }) {
  return <DailyWisdom context="quran" className={className} labelText="From the Book" />;
}
