"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";

export default function TasbeehPage() {
  const { tasbeehCounters, incrementTasbeeh, resetTasbeeh, resetAllTasbeeh } =
    useStore();
  const [activeId, setActiveId] = useState(tasbeehCounters[0]?.id || "subhanallah");
  const [showCelebration, setShowCelebration] = useState(false);

  const activeCounter = tasbeehCounters.find((c) => c.id === activeId) || tasbeehCounters[0];
  const progress = activeCounter ? (activeCounter.count / activeCounter.target) * 100 : 0;
  // Used for future celebration animation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isComplete = activeCounter && activeCounter.count >= activeCounter.target;

  const handleTap = () => {
    if (!activeCounter) return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    incrementTasbeeh(activeCounter.id);

    // Check if just reached target
    if (activeCounter.count + 1 === activeCounter.target) {
      setShowCelebration(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50, 50, 100]);
      }
      setTimeout(() => setShowCelebration(false), 1500);
    }
  };

  const totalToday = tasbeehCounters.reduce((sum, c) => sum + c.count, 0);

  return (
    <div>
      <PageHeader
        title="Tasbeeh"
        subtitle={`${totalToday} dhikr today`}
      />

      <div className="px-6 pb-8">
        {/* Main Counter */}
        <Card className="mb-6 relative overflow-hidden">
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-center"
                >
                  <p className="text-4xl mb-2">MashaAllah!</p>
                  <p className="text-lg" style={{ color: "var(--accent-gold)" }}>
                    Target reached
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center py-4">
            {/* Arabic Name */}
            <p
              className="text-3xl font-semibold mb-1"
              style={{ fontFamily: "system-ui", direction: "rtl" }}
            >
              {activeCounter?.arabicName}
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              {activeCounter?.name}
            </p>

            {/* Circular Tap Area with Conic Gradient Progress */}
            <button
              onClick={handleTap}
              className="relative w-48 h-48 rounded-full flex items-center justify-center transition-transform active:scale-[0.97]"
              style={{
                background: `conic-gradient(var(--accent-gold) ${Math.min(progress, 100)}%, var(--surface-2) ${Math.min(progress, 100)}%)`,
              }}
            >
              <div
                className="absolute w-[176px] h-[176px] rounded-full flex flex-col items-center justify-center"
                style={{ background: "var(--surface-1)" }}
              >
                <span className="text-5xl font-bold tabular-nums">
                  {activeCounter?.count}
                </span>
                <span className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  / {activeCounter?.target}
                </span>
              </div>
            </button>

            {/* Progress Bar */}
            <div className="w-full mt-6 px-4">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--surface-2)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent-gold)" }}
                  initial={false}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => resetTasbeeh(activeCounter?.id || "")}
              className="mt-4 px-4 py-2 text-xs font-medium rounded-full transition-colors"
              style={{ background: "var(--surface-2)", color: "var(--muted)" }}
            >
              Reset Counter
            </button>
          </div>
        </Card>

        {/* Counter Selector */}
        <div
          className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
          style={{ color: "var(--accent-gold)" }}
        >
          Select Dhikr
        </div>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {tasbeehCounters.map((counter) => {
            const isActive = counter.id === activeId;
            const counterProgress = (counter.count / counter.target) * 100;
            const counterComplete = counter.count >= counter.target;

            return (
              <button
                key={counter.id}
                onClick={() => setActiveId(counter.id)}
                className="flex flex-col items-center p-3 rounded-xl transition-all active:scale-[0.97]"
                style={{
                  background: isActive ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: isActive
                    ? "1px solid var(--selected-gold-border)"
                    : "1px solid transparent",
                }}
              >
                <span
                  className="text-lg mb-0.5"
                  style={{ fontFamily: "system-ui", direction: "rtl" }}
                >
                  {counter.arabicName.split(" ")[0]}
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isActive || counterComplete ? "var(--accent-gold)" : "var(--muted)",
                  }}
                >
                  {counter.count}/{counter.target}
                </span>
                {/* Mini progress bar */}
                <div
                  className="w-full h-0.5 rounded-full mt-1.5 overflow-hidden"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(counterProgress, 100)}%`,
                      background: "var(--accent-gold)",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset All */}
        <div className="text-center">
          <button
            onClick={resetAllTasbeeh}
            className="px-6 py-2.5 text-sm font-medium rounded-full transition-colors"
            style={{ background: "var(--surface-1)", color: "var(--muted)" }}
          >
            Reset All Counters
          </button>
        </div>

        {/* Tip */}
        <Card delay={0.15} className="mt-6">
          <p
            className="text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: "var(--accent-gold)" }}
          >
            Sunnah Reminder
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            The Prophet (PBUH) said: &ldquo;Whoever says SubhanAllah 33 times, Alhamdulillah 33
            times, and Allahu Akbar 33 times after each prayer will have all their sins
            forgiven.&rdquo;
          </p>
        </Card>
      </div>
    </div>
  );
}
