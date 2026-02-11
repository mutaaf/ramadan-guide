"use client";

import type { AdminGenerationStatus } from "@/lib/series/types";

interface GenerationProgressProps {
  status: AdminGenerationStatus;
  onRetry: () => void;
}

const statusLabels: Record<AdminGenerationStatus["status"], string> = {
  pending: "Waiting to start...",
  transcribing: "Transcribing audio...",
  analyzing: "AI analyzing transcript...",
  complete: "Generation complete!",
  error: "Generation failed",
};

export function GenerationProgress({ status, onRetry }: GenerationProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{statusLabels[status.status]}</span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {status.progress}%
        </span>
      </div>

      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${status.progress}%`,
            background: status.status === "error" ? "#ef4444" : "var(--accent-gold)",
          }}
        />
      </div>

      {status.status === "analyzing" && (
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Phase 1: Extracting hadiths, verses, and key quotes...
        </p>
      )}

      {status.status === "error" && (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: "#ef4444" }}>{status.error}</p>
          <button
            onClick={onRetry}
            className="text-xs font-medium px-3 py-1.5 rounded-xl"
            style={{ background: "var(--surface-1)" }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
