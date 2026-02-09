"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScheduleGenerationOutput } from "@/lib/ai/types";
import { SCHEDULE_CATEGORY_COLORS } from "@/lib/ramadan";
import { Card } from "@/components/Card";
import { ScheduleBlockEditor } from "./ScheduleBlockEditor";

interface SchedulePreviewProps {
  schedule: ScheduleGenerationOutput;
  onSave: () => void;
  onRegenerate: () => void;
  onBack: () => void;
}

function formatTime12h(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function SchedulePreview({ schedule, onSave, onRegenerate, onBack }: SchedulePreviewProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [blocks, setBlocks] = useState(schedule.blocks);

  const handleBlockUpdate = (index: number, updatedBlock: typeof blocks[0]) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    // Sort by start time
    newBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setBlocks(newBlocks);
    setEditingIndex(null);
  };

  const handleBlockDelete = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">Your Schedule</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Review and customize your personalized Ramadan routine
        </p>
      </div>

      {/* Coach Reasoning */}
      {schedule.reasoning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 mb-4"
          style={{ background: "var(--selected-gold-bg)", border: "1px solid var(--accent-gold)" }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-gold)" }}>
            Coach Hamza&apos;s Notes
          </p>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            {schedule.reasoning}
          </p>
        </motion.div>
      )}

      {/* Tips */}
      {schedule.tips && schedule.tips.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>Quick Tips</p>
          <div className="flex flex-wrap gap-2">
            {schedule.tips.map((tip, i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1 text-xs"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              >
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Blocks */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6">
        <div className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
          Daily Schedule ({blocks.length} blocks)
        </div>
        <div className="space-y-1.5">
          {blocks.map((block, i) => (
            <motion.button
              key={`${block.startTime}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setEditingIndex(i)}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98]"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ background: SCHEDULE_CATEGORY_COLORS[block.category] || "#666", opacity: 0.8 }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                    {formatTime12h(block.startTime)}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>-</span>
                  <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                    {formatTime12h(block.endTime)}
                  </span>
                  {block.isFixed && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(45, 106, 79, 0.2)", color: "#2d6a4f" }}
                    >
                      Fixed
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{block.activity}</p>
              </div>
              <svg
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--muted)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 py-4 justify-center">
        {Object.entries(SCHEDULE_CATEGORY_COLORS)
          .filter(([cat]) => blocks.some((b) => b.category === cat))
          .map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: color, opacity: 0.7 }} />
              <span className="text-[10px] capitalize" style={{ color: "var(--muted)" }}>{cat}</span>
            </div>
          ))}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
            style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
          >
            Back
          </button>
          <button
            onClick={onRegenerate}
            className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
            style={{ background: "var(--surface-1)", color: "var(--accent-gold)" }}
          >
            Regenerate
          </button>
        </div>
        <button
          onClick={onSave}
          className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
        >
          Save My Schedule
        </button>
      </div>

      {/* Block Editor Modal */}
      {editingIndex !== null && blocks[editingIndex] && (
        <ScheduleBlockEditor
          block={blocks[editingIndex]}
          onSave={(updated) => handleBlockUpdate(editingIndex, updated)}
          onDelete={() => handleBlockDelete(editingIndex)}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
}
