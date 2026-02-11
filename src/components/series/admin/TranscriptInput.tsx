"use client";

import { useState } from "react";

interface TranscriptInputProps {
  onTranscriptReady: (transcript: string) => void;
}

type InputMode = "youtube" | "paste";

export function TranscriptInput({ onTranscriptReady }: TranscriptInputProps) {
  const [mode, setMode] = useState<InputMode>("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleYouTubeExtract = async () => {
    if (!youtubeUrl) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/series/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to extract transcript");
      }

      const data = await res.json();
      onTranscriptReady(data.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    onTranscriptReady(pastedText.trim());
  };

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1">
        {(["youtube", "paste"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); }}
            className="text-[12px] font-medium px-3 py-1.5 rounded-full"
            style={{
              background: mode === m ? "var(--accent-gold)" : "var(--surface-1)",
              color: mode === m ? "white" : "var(--muted)",
            }}
          >
            {m === "youtube" ? "YouTube URL" : "Paste Text"}
          </button>
        ))}
      </div>

      {mode === "youtube" && (
        <div className="space-y-2">
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
          <button
            onClick={handleYouTubeExtract}
            disabled={loading || !youtubeUrl}
            className="text-xs font-medium px-4 py-2 rounded-xl disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "white" }}
          >
            {loading ? "Extracting..." : "Extract Transcript"}
          </button>
        </div>
      )}

      {mode === "paste" && (
        <div className="space-y-2">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste the full transcript here..."
            rows={8}
            className="w-full text-sm rounded-lg px-3 py-2 resize-none"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
          <button
            onClick={handlePasteSubmit}
            disabled={!pastedText.trim()}
            className="text-xs font-medium px-4 py-2 rounded-xl disabled:opacity-50"
            style={{ background: "var(--accent-gold)", color: "white" }}
          >
            Generate Companion
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}
