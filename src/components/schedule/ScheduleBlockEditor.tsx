"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCHEDULE_CATEGORY_COLORS } from "@/lib/ramadan";

interface ScheduleBlock {
  startTime: string;
  endTime: string;
  activity: string;
  category: string;
  isFixed: boolean;
}

interface ScheduleBlockEditorProps {
  block: ScheduleBlock;
  onSave: (block: ScheduleBlock) => void;
  onDelete: () => void;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "sleep", label: "Sleep" },
  { value: "meal", label: "Meal" },
  { value: "prayer", label: "Prayer" },
  { value: "quran", label: "Qur'an" },
  { value: "training", label: "Training" },
  { value: "work", label: "Work" },
  { value: "rest", label: "Rest" },
  { value: "other", label: "Other" },
];

export function ScheduleBlockEditor({ block, onSave, onDelete, onClose }: ScheduleBlockEditorProps) {
  const [startTime, setStartTime] = useState(block.startTime);
  const [endTime, setEndTime] = useState(block.endTime);
  const [activity, setActivity] = useState(block.activity);
  const [category, setCategory] = useState(block.category);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave({
      startTime,
      endTime,
      activity,
      category,
      isFixed: block.isFixed, // Preserve the fixed status
    });
  };

  const isValid = activity.trim().length > 0 && startTime && endTime;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
          style={{ background: "var(--background)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Edit Block</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ background: "var(--surface-1)" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {block.isFixed && (
            <div
              className="rounded-xl p-3 mb-4"
              style={{ background: "rgba(45, 106, 79, 0.1)" }}
            >
              <p className="text-xs" style={{ color: "#2d6a4f" }}>
                This is a fixed block (prayer time). The time cannot be changed.
              </p>
            </div>
          )}

          {/* Activity Name */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
              Activity
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Activity name"
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Time Range */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
              Time
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={block.isFixed}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm disabled:opacity-50"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              />
              <span style={{ color: "var(--muted)" }}>to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={block.isFixed}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm disabled:opacity-50"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className="rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: category === cat.value
                      ? SCHEDULE_CATEGORY_COLORS[cat.value]
                      : "var(--surface-1)",
                    color: category === cat.value ? "#fff" : "var(--foreground)",
                    border: category === cat.value
                      ? `1px solid ${SCHEDULE_CATEGORY_COLORS[cat.value]}`
                      : "1px solid transparent",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
                Delete this block?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
              >
                Save Changes
              </button>
              {!block.isFixed && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                  style={{ color: "#ef4444" }}
                >
                  Delete Block
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
