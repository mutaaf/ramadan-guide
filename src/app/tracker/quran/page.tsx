"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";
import { DailyWisdom } from "@/components/DailyWisdom";

// Symbolic Quran icon
function QuranIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Book spine */}
      <rect x="30" y="8" width="4" height="48" rx="1" fill="currentColor" opacity="0.3" />
      {/* Left page */}
      <path
        d="M30 10C30 10 20 8 12 10C10 10.5 8 12 8 14V50C8 52 10 54 12 54C20 52 30 54 30 54V10Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Right page */}
      <path
        d="M34 10C34 10 44 8 52 10C54 10.5 56 12 56 14V50C56 52 54 54 52 54C44 52 34 54 34 54V10Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Page lines - left */}
      <line x1="14" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="14" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="14" y1="36" x2="26" y2="36" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="14" y1="44" x2="26" y2="44" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Page lines - right */}
      <line x1="38" y1="20" x2="50" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="38" y1="28" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="38" y1="36" x2="50" y2="36" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="38" y1="44" x2="50" y2="44" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// Simple CSS-based progress visualization
function QuranProgress({ progress }: { progress: number[] }) {
  const completedCount = progress.filter((p) => p === 100).length;
  const inProgressCount = progress.filter((p) => p > 0 && p < 100).length;
  const totalProgress = progress.reduce((sum, p) => sum + p, 0) / (30 * 100);
  const progressPercent = Math.round(totalProgress * 100);

  return (
    <div className="flex flex-col items-center py-4">
      {/* Circular progress with Quran icon */}
      <div className="relative w-40 h-40 mb-4">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth="8"
            opacity="0.3"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--accent-gold)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: totalProgress }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: "283",
              strokeDashoffset: 0,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <QuranIcon className="w-12 h-12 mb-1" style={{ color: "var(--accent-gold)" }} />
          <span className="text-2xl font-bold">{completedCount}</span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>of 30</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-6 text-center">
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--accent-gold)" }}>
            {completedCount}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Completed</p>
        </div>
        <div
          className="w-px h-8"
          style={{ background: "var(--card-border)" }}
        />
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--accent-teal)" }}>
            {inProgressCount}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>In Progress</p>
        </div>
        <div
          className="w-px h-8"
          style={{ background: "var(--card-border)" }}
        />
        <div>
          <p className="text-xl font-bold">{progressPercent}%</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Overall</p>
        </div>
      </div>
    </div>
  );
}

function ProgressModal({
  juzIndex,
  currentProgress,
  onClose,
  onSave,
}: {
  juzIndex: number;
  currentProgress: number;
  onClose: () => void;
  onSave: (progress: number) => void;
}) {
  const [value, setValue] = useState(currentProgress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="rounded-2xl p-6 w-[300px] mx-4"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-center mb-4">
          Juz {juzIndex + 1} Progress
        </h3>

        {/* Visual progress indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--ring-track)"
                strokeWidth="10"
                opacity="0.3"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--accent-gold)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${value * 2.51} 251`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold" style={{ color: "var(--accent-gold)" }}>
                {value}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[0, 25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => setValue(pct)}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                pct === 100 ? "col-span-4" : ""
              }`}
              style={{
                background: value === pct ? "var(--accent-gold)" : "var(--surface-1)",
                color: value === pct ? "#000" : "var(--muted)",
              }}
            >
              {pct === 0 ? "Not Started" : pct === 100 ? "Completed" : `${pct}%`}
            </button>
          ))}
        </div>

        {/* Slider for fine control */}
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer mb-4"
          style={{
            background: `linear-gradient(to right, var(--accent-gold) ${value}%, var(--ring-track) ${value}%)`,
          }}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: "var(--surface-1)", color: "var(--muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "#000" }}
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function QuranPage() {
  const { juzProgress, toggleJuz, setJuzProgress } = useStore();
  const [modalJuz, setModalJuz] = useState<number | null>(null);
  const doneCount = juzProgress.filter((p) => p === 100).length;

  return (
    <div>
      <PageHeader title="Qur'an" subtitle={`${doneCount}/30 Juz completed`} back="/tracker" />

      <div className="px-6 pb-8">
        {/* Progress visualization */}
        <Card className="mb-4">
          <QuranProgress progress={juzProgress} />
        </Card>

        {/* Daily wisdom */}
        <Card delay={0.1} className="mb-4">
          <DailyWisdom context="quran" labelText="From the Book" />
        </Card>

        {/* Instructions */}
        <p
          className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
          style={{ color: "var(--accent-gold)" }}
        >
          Tap to toggle • Hold for partial progress
        </p>

        {/* Grid of Juz - responsive columns */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {juzProgress.map((pct, i) => (
            <JuzButton
              key={i}
              index={i}
              progress={pct}
              onTap={() => toggleJuz(i)}
              onLongPress={() => setModalJuz(i)}
            />
          ))}
        </div>
      </div>

      {/* Progress modal */}
      {modalJuz !== null && (
        <ProgressModal
          juzIndex={modalJuz}
          currentProgress={juzProgress[modalJuz]}
          onClose={() => setModalJuz(null)}
          onSave={(progress) => {
            setJuzProgress(modalJuz, progress);
            setModalJuz(null);
          }}
        />
      )}
    </div>
  );
}

function JuzButton({
  index,
  progress,
  onTap,
  onLongPress,
}: {
  index: number;
  progress: number;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const isTouchRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTouchStart = () => {
    isTouchRef.current = true;
    longPressedRef.current = false;

    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimer();
    if (!longPressedRef.current) {
      onTap();
    }
    setTimeout(() => {
      isTouchRef.current = false;
    }, 100);
  };

  const handleMouseDown = () => {
    if (isTouchRef.current) return;
    longPressedRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, 500);
  };

  const handleMouseUp = () => {
    if (isTouchRef.current) return;
    clearTimer();
    if (!longPressedRef.current) {
      onTap();
    }
  };

  const done = progress === 100;
  const partial = progress > 0 && progress < 100;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={clearTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={clearTimer}
      className="relative flex flex-col items-center justify-center rounded-xl aspect-square overflow-hidden touch-manipulation select-none"
      style={{
        background: "var(--surface-1)",
        border: done || partial ? "1.5px solid var(--selected-gold-border)" : "1.5px solid transparent",
      }}
    >
      {/* Progress fill from bottom */}
      {progress > 0 && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0"
          style={{ background: "var(--selected-gold-bg)" }}
        />
      )}

      {/* Checkmark for completed */}
      {done && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" fill="var(--accent-gold)" />
            <path d="M4 6l1.5 1.5L8 5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}

      {/* Juz number */}
      <span
        className="relative text-base font-bold z-10"
        style={{ color: done || partial ? "var(--accent-gold)" : "var(--muted)" }}
      >
        {index + 1}
      </span>

      {/* Progress percentage or "Juz" label */}
      <span
        className="relative text-[9px] z-10"
        style={{ color: "var(--muted)" }}
      >
        {partial ? `${progress}%` : "Juz"}
      </span>
    </motion.button>
  );
}
