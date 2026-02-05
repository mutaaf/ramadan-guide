"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { WeeklyAnalysisInput, WeeklyAnalysisOutput } from "@/lib/ai/types";
import { buildWeeklyAnalysisPrompts } from "@/lib/ai/prompts/weekly-analysis";

interface WeeklySummaryProps {
  input: WeeklyAnalysisInput | null;
}

const trendIcon = (dir: "up" | "down" | "stable") => {
  if (dir === "up") return "\u2191";
  if (dir === "down") return "\u2193";
  return "\u2192";
};

const trendColor = (dir: "up" | "down" | "stable") => {
  if (dir === "up") return "var(--accent-green)";
  if (dir === "down") return "#e55";
  return "var(--muted)";
};

export function WeeklySummary({ input }: WeeklySummaryProps) {
  const ready = useAIReady();
  const buildPrompts = useCallback(
    (i: WeeklyAnalysisInput) => buildWeeklyAnalysisPrompts(i),
    []
  );
  const { data, loading, error, cached, generate } = useAI<
    WeeklyAnalysisInput,
    WeeklyAnalysisOutput
  >("weekly-analysis", input, buildPrompts);

  if (!ready || !input) return null;

  return (
    <Card delay={0.45} className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--accent-gold)" }}
        >
          Weekly Analysis
        </p>
        {cached && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
            cached
          </span>
        )}
      </div>

      {!data && !loading && !error && (
        <button
          onClick={generate}
          className="w-full rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.98]"
          style={{ background: "rgba(201, 168, 76, 0.1)", color: "var(--accent-gold)" }}
        >
          Analyze This Week
        </button>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 rounded-lg shimmer" style={{ width: `${95 - i * 10}%` }} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-xs" style={{ color: "#e55" }}>
          <p>{error}</p>
          <button onClick={generate} className="mt-2 underline" style={{ color: "var(--accent-gold)" }}>
            Try again
          </button>
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {data.summary}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(data.trends) as [string, { direction: "up" | "down" | "stable"; note: string }][]).map(
              ([key, trend]) => (
                <div
                  key={key}
                  className="rounded-xl p-3"
                  style={{ background: "var(--surface-1)" }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm font-bold" style={{ color: trendColor(trend.direction) }}>
                      {trendIcon(trend.direction)}
                    </span>
                    <span className="text-xs font-medium capitalize">{key}</span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: "var(--muted)" }}>
                    {trend.note}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="rounded-xl p-3" style={{ background: "rgba(45, 106, 79, 0.08)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--accent-green)" }}>
              Top Achievement
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.topAchievement}
            </p>
          </div>

          <div className="rounded-xl p-3" style={{ background: "rgba(201, 168, 76, 0.06)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
              Focus Area
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.focusArea}
            </p>
          </div>

          <p className="text-xs italic leading-relaxed" style={{ color: "var(--muted)" }}>
            {data.coachMessage}
          </p>
        </motion.div>
      )}
    </Card>
  );
}
