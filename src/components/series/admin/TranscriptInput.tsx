"use client";

import { useState, useRef } from "react";

interface TranscriptInputProps {
  onTranscriptReady: (transcript: string) => void;
}

type InputMode = "youtube" | "paste" | "audio";

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

export function TranscriptInput({ onTranscriptReady }: TranscriptInputProps) {
  const [mode, setMode] = useState<InputMode>("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noCaptions, setNoCaptions] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleYouTubeExtract = async () => {
    if (!youtubeUrl) return;
    setLoading(true);
    setError(null);
    setNoCaptions(false);

    try {
      const res = await fetch("/api/series/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errMsg = data.error ?? "Failed to extract transcript";
        if (errMsg.toLowerCase().includes("no captions")) {
          setNoCaptions(true);
        }
        throw new Error(errMsg);
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

  const handleAudioUpload = async (file: File) => {
    if (file.size > MAX_AUDIO_SIZE) {
      setError("File must be under 25MB");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/whisper", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Transcription failed");
      }

      const data = await res.json();
      onTranscriptReady(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1">
        {(["youtube", "paste", "audio"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); setNoCaptions(false); }}
            className="text-[12px] font-medium px-3 py-1.5 rounded-full"
            style={{
              background: mode === m ? "var(--accent-gold)" : "var(--surface-1)",
              color: mode === m ? "white" : "var(--muted)",
            }}
          >
            {m === "youtube" ? "YouTube URL" : m === "paste" ? "Paste Text" : "Audio File"}
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
          {noCaptions && (
            <div className="rounded-lg p-3" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <p className="text-xs" style={{ color: "#ef4444" }}>No captions found for this video.</p>
              <button
                onClick={() => { setMode("audio"); setError(null); setNoCaptions(false); }}
                className="text-[11px] font-medium mt-1 underline"
                style={{ color: "var(--accent-gold)" }}
              >
                Try uploading audio instead
              </button>
            </div>
          )}
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

      {mode === "audio" && (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.wav,.m4a,.ogg,.webm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAudioUpload(file);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="w-full text-sm rounded-lg px-4 py-6 flex flex-col items-center gap-2"
            style={{ background: "var(--surface-1)", border: "1px dashed var(--card-border)", color: "var(--muted)" }}
          >
            {loading ? (
              <span className="text-xs font-medium">Transcribing with Whisper...</span>
            ) : (
              <>
                <span className="text-xs font-medium">Upload audio file</span>
                <span className="text-[10px]">.mp3, .wav, .m4a, .ogg, .webm (max 25MB)</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && !noCaptions && (
        <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}
