"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BadgeDefinition } from "@/lib/badges/definitions";
import { captureBadgeImage, type CaptureFormat } from "@/lib/badges/capture";
import { shareBadge } from "@/lib/badges/share";
import { BadgeCardShare } from "./BadgeCard";

interface BadgeShareModalProps {
  badge: BadgeDefinition | null;
  onClose: () => void;
}

export function BadgeShareModal({ badge, onClose }: BadgeShareModalProps) {
  const [format, setFormat] = useState<CaptureFormat>("feed");
  const [capturing, setCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleCapture = useCallback(async (mode: "share" | "download") => {
    if (!captureRef.current || !badge) return;
    setCapturing(true);
    try {
      const blob = await captureBadgeImage(captureRef.current, format);
      if (mode === "share") {
        await shareBadge(blob, badge);
      } else {
        // Direct download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${badge.id}-${format}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled share or error
    } finally {
      setCapturing(false);
    }
  }, [badge, format]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
            style={{ background: "var(--card)", maxHeight: "85dvh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--surface-2)" }} />
            </div>

            <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: "calc(85dvh - 20px)" }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Share Achievement</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full"
                  style={{ background: "var(--surface-2)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Preview (scaled down) */}
              <div
                className="rounded-2xl overflow-hidden mb-4 mx-auto"
                style={{
                  width: "100%",
                  maxWidth: format === "feed" ? 300 : 200,
                  aspectRatio: format === "feed" ? "1/1" : "9/16",
                  background: "#1a1a1c",
                }}
              >
                <div
                  style={{
                    width: format === "feed" ? 1080 : 1080,
                    height: format === "feed" ? 1080 : 1920,
                    transform: `scale(${format === "feed" ? 300 / 1080 : 200 / 1080})`,
                    transformOrigin: "top left",
                  }}
                >
                  <BadgeCardShare badge={badge} format={format} />
                </div>
              </div>

              {/* Format toggle */}
              <div
                className="flex rounded-xl overflow-hidden mb-4"
                style={{ background: "var(--surface-1)" }}
              >
                {(["feed", "story"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{
                      background: format === f ? "var(--accent-gold)" : "transparent",
                      color: format === f ? "#000" : "var(--muted)",
                    }}
                  >
                    {f === "feed" ? "Feed (1:1)" : "Story (9:16)"}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleCapture("share")}
                  disabled={capturing}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold text-black transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                  }}
                >
                  {capturing ? "..." : "Share"}
                </button>
                <button
                  onClick={() => handleCapture("download")}
                  disabled={capturing}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "var(--surface-1)",
                    color: "var(--foreground)",
                  }}
                >
                  {capturing ? "..." : "Download"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Off-screen capture target (full size for image generation) */}
          <div
            ref={captureRef}
            style={{ position: "absolute", left: -9999, top: 0, zIndex: -1 }}
          >
            <BadgeCardShare badge={badge} format={format} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
