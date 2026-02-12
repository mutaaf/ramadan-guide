"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { ActionGuidanceInput, ActionGuidanceOutput } from "@/lib/ai/types";
import { buildActionGuidancePrompts } from "@/lib/ai/prompts/action-guidance";
import { getRamadanCountdown } from "@/lib/ramadan";
import type { SavedActionItem } from "@/lib/series/types";

const categoryConfig: Record<SavedActionItem["category"], { label: string; color: string; bg: string }> = {
  spiritual: { label: "Spiritual", color: "var(--accent-gold)", bg: "var(--selected-gold-bg)" },
  practical: { label: "Practical", color: "var(--accent-teal, #2dd4bf)", bg: "rgba(45, 212, 191, 0.12)" },
  social: { label: "Social", color: "var(--accent-blue, #60a5fa)", bg: "rgba(96, 165, 250, 0.12)" },
  study: { label: "Study", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.12)" },
};

export function SavedActionsCard() {
  const savedActionItems = useStore((s) => s.seriesUserData.savedActionItems);
  const toggleActionItemComplete = useStore((s) => s.toggleActionItemComplete);
  const userName = useStore((s) => s.userName);
  const sport = useStore((s) => s.sport);
  const ready = useAIReady();

  const [showCompleted, setShowCompleted] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(true);

  const items = Object.values(savedActionItems);
  if (items.length === 0) return null;

  const { dayOfRamadan } = getRamadanCountdown();
  const completedCount = items.filter((i) => i.completed).length;
  const pendingItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);
  const progressPct = Math.round((completedCount / items.length) * 100);

  // Group pending items by category
  const pendingGrouped = pendingItems.reduce<Record<string, SavedActionItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  // Category breakdown for badges
  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    if (!item.completed) acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  // AI Guidance input
  const guidanceInput = useMemo((): ActionGuidanceInput | null => {
    if (pendingItems.length === 0) return null;
    return {
      pendingActions: pendingItems.map((a) => ({ text: a.text, category: a.category })),
      completedCount,
      totalCount: items.length,
      userName,
      sport,
      dayOfRamadan,
    };
  }, [pendingItems.length, completedCount, items.length, userName, sport, dayOfRamadan]);

  const buildPrompts = useCallback(
    (i: ActionGuidanceInput) => buildActionGuidancePrompts(i),
    []
  );

  const { data: guidance, loading, cached } = useAI<
    ActionGuidanceInput,
    ActionGuidanceOutput
  >("action-guidance", guidanceInput, buildPrompts, {
    autoTrigger: ready && pendingItems.length > 0,
  });

  return (
    <Card>
      {/* ── Header + Progress ── */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          My Actions
        </p>
        <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
          {completedCount}/{items.length} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "var(--surface-2)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--accent-gold)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Category breakdown badges */}
      {Object.keys(categoryCounts).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const config = categoryConfig[cat as SavedActionItem["category"]];
            return (
              <span
                key={cat}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: config.bg, color: config.color }}
              >
                {count} {config.label}
              </span>
            );
          })}
        </div>
      )}

      {/* ── AI Guidance Section ── */}
      {ready && pendingItems.length > 0 && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <button
            onClick={() => setGuidanceOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">&#9733;</span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--accent-gold)" }}>
                Coach Guidance
              </span>
              {cached && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: "var(--card-bg)", color: "var(--muted)" }}
                >
                  Cached
                </span>
              )}
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                color: "var(--muted)",
                transform: guidanceOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {guidanceOpen && (
            <div className="px-3 pb-3">
              {loading && (
                <div className="space-y-2 py-1">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-3 rounded shimmer" style={{ width: `${85 - i * 15}%` }} />
                  ))}
                </div>
              )}

              {guidance && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
                  {/* Priority action */}
                  <div className="rounded-lg p-2.5" style={{ background: "var(--card-bg)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
                      Priority
                    </p>
                    <p className="text-[13px] font-semibold leading-snug">{guidance.priorityAction.action}</p>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
                      {guidance.priorityAction.why}
                    </p>
                    <p className="text-[11px] mt-1 leading-relaxed">
                      {guidance.priorityAction.howToday}
                    </p>
                  </div>

                  {/* Tips */}
                  {guidance.tips.length > 0 && (
                    <div className="space-y-1">
                      {guidance.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-[10px] mt-0.5" style={{ color: "var(--accent-gold)" }}>&#8226;</span>
                          <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Motivation */}
                  <p className="text-[11px] italic leading-relaxed" style={{ color: "var(--accent-gold)" }}>
                    {guidance.motivation}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Pending Actions (by category) ── */}
      <div className="space-y-3">
        {Object.entries(pendingGrouped).map(([category, categoryItems]) => {
          const config = categoryConfig[category as SavedActionItem["category"]];
          return (
            <div key={category}>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-2"
                style={{ background: config.bg, color: config.color }}
              >
                {config.label}
              </span>
              <div className="space-y-1.5">
                {categoryItems.map((item) => (
                  <ActionRow key={item.id} item={item} config={config} onToggle={toggleActionItemComplete} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Completed Toggle ── */}
      {completedItems.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--card-border)" }}>
          <button
            onClick={() => setShowCompleted((s) => !s)}
            className="flex items-center gap-1.5 w-full"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                color: "var(--muted)",
                transform: showCompleted ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
              Show {completedItems.length} completed
            </span>
          </button>

          {showCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 space-y-1.5"
            >
              {completedItems.map((item) => {
                const config = categoryConfig[item.category];
                return (
                  <ActionRow key={item.id} item={item} config={config} onToggle={toggleActionItemComplete} />
                );
              })}
            </motion.div>
          )}
        </div>
      )}
    </Card>
  );
}

function ActionRow({
  item,
  config,
  onToggle,
}: {
  item: SavedActionItem;
  config: { color: string; bg: string };
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex gap-3">
      <div className="pt-0.5">
        <button
          onClick={() => onToggle(item.id)}
          className="block transition-colors"
          style={{ width: 18, height: 18 }}
        >
          <span
            className="flex items-center justify-center rounded transition-colors"
            style={{
              width: 18,
              height: 18,
              borderColor: item.completed ? config.color : "var(--card-border)",
              background: item.completed ? config.bg : "transparent",
              border: `2px solid ${item.completed ? config.color : "var(--card-border)"}`,
            }}
          >
            {item.completed && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] leading-relaxed"
          style={{
            textDecoration: item.completed ? "line-through" : "none",
            opacity: item.completed ? 0.6 : 1,
          }}
        >
          {item.text}
        </p>
        <Link
          href={`/learn/series/${item.seriesId}/${item.episodeId}`}
          className="text-[10px] mt-0.5 inline-block"
          style={{ color: "var(--accent-gold)" }}
        >
          View episode &rarr;
        </Link>
      </div>
    </div>
  );
}
