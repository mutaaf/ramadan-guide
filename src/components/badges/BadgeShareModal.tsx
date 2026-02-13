"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BadgeDefinition } from "@/lib/badges/definitions";
import { captureBadgeImage, type CaptureFormat } from "@/lib/badges/capture";
import { shareBadgeImage, downloadBlob, buildShareCaption, copyCaption } from "@/lib/badges/share";
import { useStore } from "@/store/useStore";

interface BadgeShareModalProps {
  badge: BadgeDefinition | null;
  onClose: () => void;
}

export function BadgeShareModal({ badge, onClose }: BadgeShareModalProps) {
  const [format, setFormat] = useState<CaptureFormat>("story");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  const recordBadgeShare = useStore((s) => s.recordBadgeShare);

  // Generate canvas preview when badge/format changes
  useEffect(() => {
    if (!badge) {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
      blobRef.current = null;
      return;
    }

    let cancelled = false;
    blobRef.current = null;

    // Use microtask to batch state updates
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setPreviewUrl(null);
    });

    captureBadgeImage(badge, format).then((blob) => {
      if (cancelled) return;
      blobRef.current = blob;
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      const url = URL.createObjectURL(blob);
      prevUrlRef.current = url;
      setPreviewUrl(url);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [badge, format]);

  const handleShare = useCallback(async () => {
    if (!blobRef.current || !badge) return;
    setSharing(true);
    // Copy caption to clipboard first so user has it ready
    await copyCaption(badge);
    const result = await shareBadgeImage(blobRef.current, badge);
    if (result === "shared" || result === "downloaded") {
      recordBadgeShare(badge.id);
    }
    setSharing(false);
  }, [badge, recordBadgeShare]);

  const handleDownload = useCallback(async () => {
    if (!blobRef.current || !badge) return;
    setSharing(true);
    downloadBlob(blobRef.current, `ramadan-${badge.id}-${format}.png`);
    recordBadgeShare(badge.id);
    setSharing(false);
  }, [badge, format, recordBadgeShare]);

  const handleCopy = useCallback(async () => {
    if (!badge) return;
    const ok = await copyCaption(badge);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [badge]);

  const caption = badge ? buildShareCaption(badge) : "";

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
            style={{ background: "var(--card)", maxHeight: "90dvh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--surface-2)" }} />
            </div>

            <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: "calc(90dvh - 20px)" }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
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

              {/* Format toggle */}
              <div
                className="flex rounded-xl overflow-hidden mb-3"
                style={{ background: "var(--surface-1)" }}
              >
                {(["story", "feed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{
                      background: format === f ? "var(--accent-gold)" : "transparent",
                      color: format === f ? "#000" : "var(--muted)",
                    }}
                  >
                    {f === "feed" ? "Feed 1:1" : "Story 9:16"}
                  </button>
                ))}
              </div>

              {/* Canvas-rendered preview */}
              <div
                className="rounded-2xl overflow-hidden mb-3 mx-auto"
                style={{
                  width: "100%",
                  maxWidth: format === "feed" ? 280 : 200,
                  aspectRatio: format === "feed" ? "1/1" : "9/16",
                  background: "#0a0a0c",
                }}
              >
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
                    />
                  </div>
                ) : previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`${badge.title} badge`}
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>

              {/* Caption preview + copy */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                    Caption (auto-copied when sharing)
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all active:scale-95"
                    style={{
                      background: copied ? "rgba(34, 197, 94, 0.15)" : "var(--surface-1)",
                      color: copied ? "#22c55e" : "var(--muted)",
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div
                  className="rounded-xl p-3 text-xs leading-relaxed whitespace-pre-line"
                  style={{ background: "var(--surface-1)", color: "var(--muted)" }}
                >
                  {caption}
                </div>
              </div>

              {/* Social hint */}
              <p className="text-[10px] text-center mb-3" style={{ color: "var(--muted)" }}>
                Share opens your native share sheet — pick Instagram, TikTok, Snapchat, X, or any app
              </p>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  disabled={sharing || loading}
                  className="flex-1 rounded-xl py-3.5 text-sm font-bold text-black transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                    boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
                  }}
                >
                  {sharing ? "Sharing..." : "Share"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={sharing || loading}
                  className="rounded-xl py-3.5 px-5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
