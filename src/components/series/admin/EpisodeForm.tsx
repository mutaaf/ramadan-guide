"use client";

import { useState } from "react";
import type { Episode } from "@/lib/series/types";
import { validateRequired, validateDuration, validateYouTubeUrl, type FieldErrors } from "@/lib/series/validation";

interface EpisodeFormProps {
  seriesId: string;
  episodeNumber: number;
  initial?: Episode;
  onSave: (episode: Episode) => void;
  onCancel: () => void;
}

export function EpisodeForm({ seriesId, episodeNumber, initial, onSave, onCancel }: EpisodeFormProps) {
  const [epNumber, setEpNumber] = useState(initial?.episodeNumber ?? episodeNumber);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const e: FieldErrors = {
      title: validateRequired(title, "Title"),
      duration: validateDuration(duration),
      youtubeUrl: validateYouTubeUrl(youtubeUrl),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const id = initial?.id ?? `${seriesId}-ep-${String(epNumber).padStart(2, "0")}`;
    onSave({
      id,
      seriesId,
      episodeNumber: epNumber,
      ...(initial?.status ? { status: initial.status } : {}),
      title,
      duration,
      youtubeUrl: youtubeUrl || undefined,
      publishedAt: initial?.publishedAt ?? new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-[80px_1fr] gap-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Ep #</label>
          <input
            type="number"
            min={1}
            value={epNumber}
            onChange={(e) => setEpNumber(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
        <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: `1px solid ${errors.title ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
        />
        {errors.title && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.title}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Duration</label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="45:32"
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: `1px solid ${errors.duration ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
          />
          {errors.duration && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.duration}</p>}
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>YouTube URL</label>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: `1px solid ${errors.youtubeUrl ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
          />
          {errors.youtubeUrl && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.youtubeUrl}</p>}
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
