"use client";

import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { BehaviorInsightInput, BehaviorInsightOutput } from "@/lib/ai/types";
import { buildBehaviorInsightPrompts } from "@/lib/ai/prompts/behavior-insight";
import { analyzeBehavior } from "@/lib/ai/behavior";
import { useStore } from "@/store/useStore";
import { getRamadanCountdown } from "@/lib/ramadan";

export function ProactiveInsight() {
  const ready = useAIReady();
  const { days, userName, sport } = useStore();
  const { dayOfRamadan } = getRamadanCountdown();

  const dayEntries = useMemo(() => Object.values(days), [days]);

  const insightInput = useMemo((): BehaviorInsightInput | null => {
    const analysis = analyzeBehavior(dayEntries);
    if (!analysis) return null;

    // Only trigger if there are meaningful patterns
    if (
      analysis.concerns.length === 0 &&
      analysis.achievements.length === 0 &&
      analysis.streaks.length === 0
    )
      return null;

    return {
      ...analysis,
      userName,
      sport,
      dayOfRamadan,
    };
  }, [dayEntries, userName, sport, dayOfRamadan]);

  const buildPrompts = useCallback(
    (i: BehaviorInsightInput) => buildBehaviorInsightPrompts(i),
    []
  );

  const { data, loading, error } = useAI<
    BehaviorInsightInput,
    BehaviorInsightOutput
  >("behavior-insight", insightInput, buildPrompts, { autoTrigger: true });

  if (!ready || !insightInput) return null;

  return (
    <Card delay={0.4} className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold"
          style={{
            background: "var(--selected-gold-bg)",
            color: "var(--accent-gold)",
          }}
        >
          H
        </div>
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--accent-gold)" }}
        >
          Coach Hamza&apos;s Insight
        </p>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 rounded-lg shimmer"
              style={{ width: `${90 - i * 15}%` }}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs" style={{ color: "#e55" }}>
          {error}
        </p>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <p className="text-sm font-semibold">{data.headline}</p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {data.insight}
          </p>
          <div
            className="rounded-xl p-3"
            style={{ background: "var(--selected-gold-bg)" }}
          >
            <p
              className="text-[10px] font-medium uppercase tracking-wider mb-1"
              style={{ color: "var(--accent-gold)" }}
            >
              Today&apos;s Action
            </p>
            <p className="text-xs">{data.actionItem}</p>
          </div>
          <p
            className="text-xs italic leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {data.motivation}
          </p>
        </motion.div>
      )}
    </Card>
  );
}
