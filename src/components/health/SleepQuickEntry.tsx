"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircularSlider } from "@/components/ui/CircularSlider";
import { QuickLogCard } from "./QuickLogCard";
import type { HealthPatterns } from "@/lib/health/types";

interface SleepQuickEntryProps {
  suggestedHours: number;
  confidence: HealthPatterns["confidence"];
  onAccept: (hours: number) => void;
  onDismiss: () => void;
}

/**
 * Apple-style circular dial for sleep hours entry
 *
 * Shows suggested value and allows adjustment via circular drag.
 */
export function SleepQuickEntry({
  suggestedHours,
  confidence,
  onAccept,
  onDismiss,
}: SleepQuickEntryProps) {
  const [hours, setHours] = useState(0);
  const [showSlider, setShowSlider] = useState(false);

  const handleAccept = useCallback(() => {
    onAccept(hours);
  }, [hours, onAccept]);

  const handleLongPress = useCallback(() => {
    setShowSlider(true);
  }, []);

  return (
    <QuickLogCard
      onAccept={handleAccept}
      onDismiss={onDismiss}
      showActions={!showSlider}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">😴</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: "var(--foreground)" }}>
              Sleep
            </span>
          </div>

          <AnimatePresence mode="wait">
            {!showSlider ? (
              <motion.div
                key="quick"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Progress bar representation */}
                <motion.div
                  className="flex items-center gap-2 mt-2"
                  onTouchStart={() => {
                    const timer = setTimeout(handleLongPress, 500);
                    const handleEnd = () => clearTimeout(timer);
                    document.addEventListener('touchend', handleEnd, { once: true });
                  }}
                  onMouseDown={() => {
                    const timer = setTimeout(handleLongPress, 500);
                    const handleEnd = () => clearTimeout(timer);
                    document.addEventListener('mouseup', handleEnd, { once: true });
                  }}
                  style={{ cursor: "pointer" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Progress track */}
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--accent-blue)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(hours / 12) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold tabular-nums min-w-[3rem] text-right"
                    style={{ color: "var(--foreground)" }}
                  >
                    {hours}h
                  </span>
                </motion.div>

                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--muted)" }}
                >
                  Usually {suggestedHours}h · Long press to adjust
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="slider"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="py-4"
              >
                <div className="flex flex-col items-center">
                  <CircularSlider
                    value={hours}
                    min={0}
                    max={12}
                    step={0.5}
                    size={140}
                    strokeWidth={10}
                    onChange={setHours}
                    label="hours"
                    color="var(--accent-blue)"
                  />

                  <div className="flex gap-2 mt-4">
                    <motion.button
                      onClick={handleAccept}
                      className="px-5 py-2 rounded-full text-sm font-medium"
                      style={{
                        background: "var(--accent-blue)",
                        color: "white",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Confirm {hours}h
                    </motion.button>
                    <motion.button
                      onClick={() => setShowSlider(false)}
                      className="px-4 py-2 rounded-full text-sm"
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--muted)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </QuickLogCard>
  );
}
