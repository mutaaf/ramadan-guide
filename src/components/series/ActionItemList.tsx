"use client";

import { motion } from "framer-motion";
import type { ActionItem } from "@/lib/series/types";
import { useStore } from "@/store/useStore";

interface ActionItemListProps {
  items: ActionItem[];
  seriesId?: string;
  episodeId?: string;
}

const categoryConfig: Record<ActionItem["category"], { label: string; color: string; bg: string }> = {
  spiritual: { label: "Spiritual", color: "var(--accent-gold)", bg: "var(--selected-gold-bg)" },
  practical: { label: "Practical", color: "var(--accent-teal, #2dd4bf)", bg: "rgba(45, 212, 191, 0.12)" },
  social: { label: "Social", color: "var(--accent-blue, #60a5fa)", bg: "rgba(96, 165, 250, 0.12)" },
  study: { label: "Study", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.12)" },
};

export function ActionItemList({ items, seriesId, episodeId }: ActionItemListProps) {
  const savedActionItems = useStore((s) => s.seriesUserData.savedActionItems) ?? {};
  const toggleSaveActionItem = useStore((s) => s.toggleSaveActionItem);
  const toggleActionItemComplete = useStore((s) => s.toggleActionItemComplete);
  const canSave = !!(seriesId && episodeId);

  const savedCount = canSave
    ? items.filter((_, i) => savedActionItems[`${seriesId}:${episodeId}:${i}`]).length
    : 0;
  const completedCount = canSave
    ? items.filter((_, i) => savedActionItems[`${seriesId}:${episodeId}:${i}`]?.completed).length
    : 0;

  const grouped = items.reduce<Record<string, { item: ActionItem; index: number }[]>>((acc, item, i) => {
    (acc[item.category] ??= []).push({ item, index: i });
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      {canSave && savedCount > 0 && (
        <div className="rounded-xl p-3" style={{ background: "var(--surface-1)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
              Your Progress
            </p>
            <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
              {completedCount}/{savedCount} completed
            </p>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${savedCount > 0 ? (completedCount / savedCount) * 100 : 0}%`,
                background: completedCount === savedCount ? "#22c55e" : "var(--accent-gold)",
              }}
            />
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([category, categoryEntries], gi) => {
        const config = categoryConfig[category as ActionItem["category"]];
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-2"
              style={{ background: config.bg, color: config.color }}
            >
              {config.label}
            </span>
            <div className="space-y-2">
              {categoryEntries.map(({ item, index }) => {
                const itemId = canSave ? `${seriesId}:${episodeId}:${index}` : null;
                const savedItem = itemId ? savedActionItems[itemId] : null;
                const isSaved = !!savedItem;
                const isCompleted = savedItem?.completed ?? false;

                return (
                  <div
                    key={index}
                    className="rounded-xl px-3 py-3 transition-colors"
                    style={{
                      background: isCompleted ? "rgba(34, 197, 94, 0.06)" : "var(--surface-1)",
                      border: isCompleted ? "1px solid rgba(34, 197, 94, 0.15)" : "1px solid transparent",
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Checkbox / indicator — fixed size, never stretches */}
                      <div className="pt-0.5">
                        {isSaved ? (
                          <button
                            onClick={() => toggleActionItemComplete(itemId!)}
                            className="block"
                            style={{ width: 20, height: 20 }}
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                          >
                            <span
                              className="flex items-center justify-center rounded-md transition-colors"
                              style={{
                                width: 20,
                                height: 20,
                                background: isCompleted ? "#22c55e" : "transparent",
                                border: isCompleted ? "none" : "2px solid var(--card-border)",
                              }}
                            >
                              {isCompleted && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </span>
                          </button>
                        ) : (
                          <span
                            className="flex items-center justify-center rounded-full"
                            style={{ width: 20, height: 20, background: config.bg }}
                          >
                            <span className="rounded-full" style={{ width: 6, height: 6, background: config.color }} />
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <p
                        className="flex-1 text-[13px] leading-relaxed min-w-0"
                        style={isCompleted ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}
                      >
                        {item.text}
                      </p>

                      {/* Bookmark */}
                      {canSave && (
                        <div className="pt-0.5">
                          <button
                            onClick={() => toggleSaveActionItem({ text: item.text, category: item.category, episodeId: episodeId!, seriesId: seriesId!, index })}
                            className="block rounded-md transition-colors"
                            style={{
                              width: 28,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: isSaved ? "var(--selected-gold-bg)" : "transparent",
                            }}
                            title={isSaved ? "Remove from tracker" : "Save to tracker"}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill={isSaved ? "var(--accent-gold)" : "none"}
                              stroke={isSaved ? "var(--accent-gold)" : "var(--muted)"}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
