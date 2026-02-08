"use client";

import { useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { AIInsightsInput, AIInsightsOutput } from "@/lib/ai/types";
import { buildAIInsightsPrompts } from "@/lib/ai/prompts/ai-insights";
import { computeInsightsData } from "@/lib/ai/computeInsightsData";
import { useStore } from "@/store/useStore";
import { getRamadanCountdown } from "@/lib/ramadan";

export function AIInsights() {
  const ready = useAIReady();
  const { days, userName, sport, juzProgress } = useStore();
  const { dayOfRamadan } = getRamadanCountdown();
  const [lastRefresh, setLastRefresh] = useState(0);

  const daysTracked = useMemo(
    () => Object.values(days).filter((d) => d.date).length,
    [days]
  );

  const insightInput = useMemo((): AIInsightsInput | null => {
    return computeInsightsData(days, userName, sport, juzProgress, dayOfRamadan);
  }, [days, userName, sport, juzProgress, dayOfRamadan]);

  const buildPrompts = useCallback(
    (i: AIInsightsInput) => buildAIInsightsPrompts(i),
    []
  );

  const { data, loading, error, generate, cached } = useAI<
    AIInsightsInput,
    AIInsightsOutput
  >("ai-insights", insightInput, buildPrompts, { autoTrigger: true });

  const handleRefresh = useCallback(() => {
    const now = Date.now();
    // 1 minute cooldown
    if (now - lastRefresh < 60000) return;
    setLastRefresh(now);
    generate();
  }, [generate, lastRefresh]);

  const canRefresh = Date.now() - lastRefresh >= 60000;

  // Empty state: not enough data
  if (daysTracked < 3) {
    return (
      <Card className="overflow-hidden">
        <div className="text-center py-4">
          <span className="text-2xl mb-2 block">📊</span>
          <p className="text-sm font-medium">Building Your Profile</p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted)" }}
          >
            Track a few more days to unlock personalized insights
          </p>
          <div className="flex gap-1 justify-center mt-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    i <= daysTracked ? "var(--accent-gold)" : "var(--surface-2)",
                }}
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Not ready (no API key)
  if (!ready) return null;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg text-xs"
            style={{
              background: "var(--selected-gold-bg)",
              color: "var(--accent-gold)",
            }}
          >
            ✨
          </div>
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--accent-gold)" }}
          >
            AI Insights
          </p>
        </div>
        {data && !loading && (
          <button
            onClick={handleRefresh}
            disabled={!canRefresh}
            className="text-xs px-2 py-1 rounded-lg transition-opacity"
            style={{
              background: "var(--surface-2)",
              color: canRefresh ? "var(--foreground)" : "var(--muted)",
              opacity: canRefresh ? 1 : 0.5,
              cursor: canRefresh ? "pointer" : "not-allowed",
            }}
          >
            {cached ? "Cached" : "Refresh"}
          </button>
        )}
      </div>

      {/* Loading state */}
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

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-2">
          <p className="text-xs mb-2" style={{ color: "#e55" }}>
            {error}
          </p>
          <button
            onClick={generate}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--selected-gold-bg)",
              color: "var(--accent-gold)",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Data state */}
      {data && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {/* Headline */}
          <p className="text-sm font-bold">{data.headline}</p>

          {/* Insight */}
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {data.insight}
          </p>

          {/* Metric pill */}
          {data.metric && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: "var(--selected-gold-bg)" }}
            >
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {data.metric.label}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--accent-gold)" }}
              >
                {data.metric.value}
              </span>
              {data.metric.trend === "up" && (
                <span style={{ color: "#4ade80" }}>↑</span>
              )}
              {data.metric.trend === "down" && (
                <span style={{ color: "#f87171" }}>↓</span>
              )}
              {data.metric.trend === "stable" && (
                <span style={{ color: "var(--muted)" }}>→</span>
              )}
            </div>
          )}

          {/* Celebration */}
          {data.celebration && (
            <div
              className="rounded-xl p-3 mt-2"
              style={{ background: "var(--selected-gold-bg)" }}
            >
              <p
                className="text-[10px] font-medium uppercase tracking-wider mb-1"
                style={{ color: "var(--accent-gold)" }}
              >
                🎉 Achievement
              </p>
              <p className="text-xs">{data.celebration}</p>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}
