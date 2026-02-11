"use client";

import { useState } from "react";
import type { Episode } from "@/lib/series/types";

interface EpisodeFormProps {
  seriesId: string;
  episodeNumber: number;
  initial?: Episode;
  onSave: (episode: Episode) => void;
  onCancel: () => void;
}

export function EpisodeForm({ seriesId, episodeNumber, initial, onSave, onCancel }: EpisodeFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const epNum = initial?.episodeNumber ?? episodeNumber;
    const id = initial?.id ?? `${seriesId}-ep-${String(epNum).padStart(2, "0")}`;
    onSave({
      id,
      seriesId,
      episodeNumber: epNum,
      title,
      duration,
      youtubeUrl: youtubeUrl || undefined,
      publishedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>
          Episode {initial?.episodeNumber ?? episodeNumber} Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Duration</label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="45:32"
            required
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>YouTube URL</label>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="text-xs font-medium px-4 py-2 rounded-xl"
          style={{ background: "var(--accent-gold)", color: "white" }}
        >
          {initial ? "Update" : "Add"} Episode
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium px-4 py-2 rounded-xl"
          style={{ background: "var(--surface-1)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
