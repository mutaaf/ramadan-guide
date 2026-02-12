"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import type { Episode } from "@/lib/series/types";

type EpisodeStatus = "pending" | "extracting" | "success" | "failed";

interface Props {
  seriesId: string;
  episodes: Episode[];
}

export function BulkTranscriptExtractor({ seriesId, episodes }: Props) {
  const { transcripts, setTranscript } = useAdminStore();

  const needsTranscript = episodes.filter(
    (ep) => ep.youtubeUrl && !transcripts[ep.id]
  );

  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, EpisodeStatus>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const completedCount = Object.values(statuses).filter(
    (s) => s === "success" || s === "failed"
  ).length;

  const successCount = Object.values(statuses).filter(
    (s) => s === "success"
  ).length;

  const failedCount = Object.values(statuses).filter(
    (s) => s === "failed"
  ).length;

  const handleStart = useCallback(async () => {
    setRunning(true);
    setStatuses({});
    setCurrentIndex(0);

    for (let i = 0; i < needsTranscript.length; i++) {
      const ep = needsTranscript[i];
      setCurrentIndex(i);
      setStatuses((prev) => ({ ...prev, [ep.id]: "extracting" }));

      try {
        const res = await fetch("/api/series/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl: ep.youtubeUrl }),
        });

        if (!res.ok) {
          setStatuses((prev) => ({ ...prev, [ep.id]: "failed" }));
        } else {
          const data = await res.json();
          if (data.transcript) {
            setTranscript(ep.id, data.transcript);
            setStatuses((prev) => ({ ...prev, [ep.id]: "success" }));
          } else {
            setStatuses((prev) => ({ ...prev, [ep.id]: "failed" }));
          }
        }
      } catch {
        setStatuses((prev) => ({ ...prev, [ep.id]: "failed" }));
      }

      // Rate limit: 1s delay between requests
      if (i < needsTranscript.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setRunning(false);
  }, [needsTranscript, setTranscript]);

  if (needsTranscript.length === 0) return null;

  const statusIcon = (s: EpisodeStatus | undefined) => {
    switch (s) {
      case "extracting":
        return <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent-gold)" }} />;
      case "success":
        return <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />;
      case "failed":
        return <span className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />;
      default:
        return <span className="w-2 h-2 rounded-full" style={{ background: "var(--card-border)" }} />;
    }
  };

  // Suppress lint warning for unused seriesId — kept for future use
  void seriesId;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
            Bulk Extract Transcripts
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {needsTranscript.length} episodes need transcripts
          </p>
        </div>
        {!running && completedCount === 0 && (
          <button
            onClick={handleStart}
            className="text-xs font-medium px-3 py-1.5 rounded-xl"
            style={{ background: "var(--accent-gold)", color: "white" }}
          >
            Start Extraction
          </button>
        )}
      </div>

      {/* Progress bar */}
      {(running || completedCount > 0) && (
        <div className="space-y-2 mb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(completedCount / needsTranscript.length) * 100}%`,
                background: !running && completedCount === needsTranscript.length ? "#22c55e" : "var(--accent-gold)",
              }}
            />
          </div>
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            {running
              ? `Extracting ${currentIndex + 1} of ${needsTranscript.length}...`
              : `Done: ${successCount} extracted, ${failedCount} failed`}
          </p>
        </div>
      )}

      {/* Episode list */}
      <div className="space-y-1 max-h-[30vh] overflow-y-auto">
        {needsTranscript.map((ep) => (
          <div
            key={ep.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
          >
            {statusIcon(statuses[ep.id])}
            <span className="flex-1 min-w-0 truncate">{ep.title}</span>
            <span style={{ color: "var(--muted)" }}>
              {statuses[ep.id] === "extracting"
                ? "Extracting..."
                : statuses[ep.id] === "success"
                  ? "Done"
                  : statuses[ep.id] === "failed"
                    ? "No captions"
                    : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
