"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/Card";
import { useSeriesUserActions } from "@/lib/series/hooks";

interface EpisodeNotesProps {
  episodeId: string;
}

export function EpisodeNotes({ episodeId }: EpisodeNotesProps) {
  const { getNote, setEpisodeNote } = useSeriesUserActions();
  const savedNote = getNote(episodeId);
  const [note, setNote] = useState(savedNote);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(savedNote);
  }, [savedNote]);

  const handleChange = (value: string) => {
    setNote(value);
    setSaved(false);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setEpisodeNote(episodeId, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--accent-gold)" }}
        >
          My Notes
        </p>
        {saved && (
          <span className="text-[10px] font-medium" style={{ color: "var(--accent-teal, #2dd4bf)" }}>
            Saved
          </span>
        )}
      </div>
      <textarea
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your reflections and takeaways..."
        rows={4}
        className="w-full text-[13px] leading-relaxed rounded-xl p-3 resize-none focus:outline-none"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--card-border)",
          color: "var(--foreground)",
        }}
      />
    </Card>
  );
}
