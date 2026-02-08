"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ReactNode, useCallback, useState } from "react";
import { triggerHaptic } from "@/hooks/useSmartPrompts";

interface QuickLogCardProps {
  children: ReactNode;
  onDismiss?: () => void;
  onAccept?: () => void;
  showActions?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 100;

/**
 * Swipeable card wrapper for quick log entries
 *
 * - Swipe left to dismiss
 * - Tap check to accept
 * - Tap X to dismiss and show manual entry
 */
export function QuickLogCard({
  children,
  onDismiss,
  onAccept,
  showActions = true,
  className = "",
}: QuickLogCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [0.5, 1]);
  const scale = useTransform(x, [-SWIPE_THRESHOLD * 2, 0], [0.9, 1]);
  const dismissOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = useCallback((
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      setIsDismissed(true);
      triggerHaptic('medium');
      onDismiss?.();
    }
  }, [onDismiss]);

  const handleAccept = useCallback(() => {
    triggerHaptic('light');
    onAccept?.();
  }, [onAccept]);

  const handleDismiss = useCallback(() => {
    triggerHaptic('light');
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (isDismissed) {
    return null;
  }

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
    >
      {/* Dismiss indicator behind card */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4"
        style={{ opacity: dismissOpacity }}
      >
        <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Dismiss
        </span>
      </motion.div>

      {/* Main card content */}
      <motion.div
        className="relative rounded-xl p-4"
        style={{
          x,
          opacity,
          scale,
          background: "var(--surface-1)",
          border: "1px solid var(--card-border)",
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {children}
          </div>

          {showActions && (
            <div className="flex gap-2 shrink-0">
              <motion.button
                onClick={handleAccept}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--accent-green)",
                  color: "white",
                }}
                whileTap={{ scale: 0.9 }}
                aria-label="Accept suggestion"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.button>

              <motion.button
                onClick={handleDismiss}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--muted)",
                }}
                whileTap={{ scale: 0.9 }}
                aria-label="Dismiss suggestion"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
