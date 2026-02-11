"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { QuickLogCard } from "./QuickLogCard";
import { triggerHaptic } from "@/hooks/useSmartPrompts";
import type { HealthPatterns } from "@/lib/health/types";

interface HydrationQuickEntryProps {
  suggestedGlasses: number;
  currentGlasses: number;
  confidence: HealthPatterns["confidence"];
  onChange?: (glasses: number) => void;
  onDismiss: () => void;
  maxGlasses?: number;
}

/**
 * Tap-to-fill glass visualization for hydration tracking
 *
 * 8 glasses in a row - tap to toggle filled/empty.
 */
export function HydrationQuickEntry({
  suggestedGlasses,
  currentGlasses,
  confidence,
  onChange,
  onDismiss,
  maxGlasses = 8,
}: HydrationQuickEntryProps) {
  const [glasses, setGlasses] = useState(currentGlasses);

  const handleGlassTap = useCallback((index: number) => {
    triggerHaptic('light');
    // Tap on a filled glass empties it and all after it
    // Tap on an empty glass fills it and all before it
    const isCurrentlyFilled = index < glasses;
    const newValue = isCurrentlyFilled ? index : index + 1;
    setGlasses(newValue);
    onChange?.(newValue);
  }, [glasses, onChange]);

  return (
    <QuickLogCard
      onDismiss={onDismiss}
      showActions={false}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">💧</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium" style={{ color: "var(--foreground)" }}>
              Hydration
            </span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: "var(--accent-blue)" }}
            >
              {glasses}/{maxGlasses}
            </span>
          </div>

          {/* Glass grid */}
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: maxGlasses }, (_, i) => {
              const isFilled = i < glasses;
              return (
                <motion.button
                  key={i}
                  onClick={() => handleGlassTap(i)}
                  className="relative flex-1 min-w-0 h-9 rounded-md"
                  style={{
                    background: isFilled
                      ? "var(--accent-blue)"
                      : "var(--surface-2)",
                    border: isFilled
                      ? "none"
                      : "1px dashed var(--card-border)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  initial={false}
                  animate={{
                    background: isFilled
                      ? "var(--accent-blue)"
                      : "var(--surface-2)",
                  }}
                  transition={{ duration: 0.15 }}
                  aria-label={`Glass ${i + 1} - ${isFilled ? "filled" : "empty"}`}
                >
                  {/* Glass icon shape */}
                  <svg
                    viewBox="0 0 24 32"
                    className="absolute inset-0 w-full h-full p-1"
                    fill="none"
                    stroke={isFilled ? "rgba(255,255,255,0.3)" : "var(--muted)"}
                    strokeWidth="1.5"
                    opacity={isFilled ? 1 : 0.4}
                  >
                    <path d="M5 4 L19 4 L17 28 L7 28 Z" />
                    {isFilled && (
                      <motion.path
                        d="M7 12 L17 12 L16 26 L8 26 Z"
                        fill="rgba(255,255,255,0.5)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </svg>
                </motion.button>
              );
            })}
          </div>

          <p
            className="text-xs mt-2"
            style={{ color: "var(--muted)" }}
          >
            {currentGlasses > 0
              ? "Currently logged · Tap to adjust"
              : `Usually ${suggestedGlasses} glasses · Tap to fill`}
          </p>
        </div>
      </div>
    </QuickLogCard>
  );
}
