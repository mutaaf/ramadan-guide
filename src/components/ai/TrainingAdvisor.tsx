"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { TrainingAdviceInput, TrainingAdviceOutput } from "@/lib/ai/types";
import { buildTrainingAdvicePrompts } from "@/lib/ai/prompts/training-advice";

interface TrainingAdvisorProps {
  input: TrainingAdviceInput | null;
}

export function TrainingAdvisor({ input }: TrainingAdvisorProps) {
  const ready = useAIReady();
  const buildPrompts = useCallback(
    (i: TrainingAdviceInput) => buildTrainingAdvicePrompts(i),
    []
  );
  const { data, loading, error, cached, generate } = useAI<
    TrainingAdviceInput,
    TrainingAdviceOutput
  >("training-advice", input, buildPrompts);

  if (!ready) return null;

  const intensityColor =
    data && data.intensityPercent >= 80
      ? "var(--accent-green)"
      : data && data.intensityPercent >= 60
        ? "var(--accent-gold)"
        : "#e55";

  return (
    <Card delay={0.45} className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Training Advisor
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
          Get Training Advice
        </button>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 rounded-lg shimmer" style={{ width: `${85 - i * 10}%` }} />
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
          {/* Intensity gauge */}
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--ring-track)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke={intensityColor}
                  strokeWidth="3"
                  strokeDasharray={`${data.intensityPercent} ${100 - data.intensityPercent}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{data.intensityPercent}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Recommended Intensity</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {data.timing}
              </p>
            </div>
          </div>

          <div className="rounded-xl p-3" style={{ background: "var(--surface-1)" }}>
            <p className="text-xs font-medium mb-1">Warm-Up</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.warmUp}
            </p>
          </div>

          {data.warnings.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: "rgba(238, 85, 85, 0.06)" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#e55" }}>
                Warnings
              </p>
              {data.warnings.map((w, i) => (
                <p key={i} className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {w}
                </p>
              ))}
            </div>
          )}

          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {data.recommendation}
          </p>
        </motion.div>
      )}
    </Card>
  );
}
