"use client";

import { motion } from "framer-motion";
import type { ActionItem } from "@/lib/series/types";

interface ActionItemListProps {
  items: ActionItem[];
}

const categoryConfig: Record<ActionItem["category"], { label: string; color: string; bg: string }> = {
  spiritual: { label: "Spiritual", color: "var(--accent-gold)", bg: "var(--selected-gold-bg)" },
  practical: { label: "Practical", color: "var(--accent-teal, #2dd4bf)", bg: "rgba(45, 212, 191, 0.12)" },
  social: { label: "Social", color: "var(--accent-blue, #60a5fa)", bg: "rgba(96, 165, 250, 0.12)" },
  study: { label: "Study", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.12)" },
};

export function ActionItemList({ items }: ActionItemListProps) {
  const grouped = items.reduce<Record<string, ActionItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([category, categoryItems], gi) => {
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
              {categoryItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg p-3"
                  style={{ background: "var(--surface-1)" }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: config.bg }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
                  </div>
                  <p className="text-[13px] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
