"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { DailyCoachingInput, DailyCoachingOutput } from "@/lib/ai/types";
import { buildDailyCoachingPrompts } from "@/lib/ai/prompts/daily-coaching";

interface CoachInsightProps {
  input: DailyCoachingInput | null;
}

export function CoachInsight({ input }: CoachInsightProps) {
  const ready = useAIReady();
  const buildPrompts = useCallback(
    (i: DailyCoachingInput) => buildDailyCoachingPrompts(i),
    []
  );
  const { data, loading, error, cached, generate } = useAI<
    DailyCoachingInput,
    DailyCoachingOutput
  >("daily-coaching", input, buildPrompts);

  if (!ready) return null;

  return (
    <Card delay={0.4} className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--accent-gold)" }}
        >
          Coach Hamza&apos;s Insight
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
          Get Today&apos;s Coaching
        </button>
      )}

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
        <div className="text-xs" style={{ color: "#e55" }}>
          <p>{error}</p>
          <button
            onClick={generate}
            className="mt-2 underline"
            style={{ color: "var(--accent-gold)" }}
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium">{data.greeting}</p>
          <div className="space-y-2">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex gap-2">
                <span
                  className="text-xs mt-0.5 shrink-0"
                  style={{ color: "var(--accent-gold)" }}
                >
                  *
                </span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(201, 168, 76, 0.06)" }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
              Tip of the Day
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.tip}
            </p>
          </div>
          <p
            className="text-xs italic leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {data.encouragement}
          </p>
        </motion.div>
      )}
    </Card>
  );
}
