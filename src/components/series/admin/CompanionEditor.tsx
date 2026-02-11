"use client";

import { useState } from "react";
import type { CompanionGuide } from "@/lib/series/types";
import { CompanionContent } from "../CompanionContent";

interface CompanionEditorProps {
  companion: CompanionGuide;
  onSave: (updated: CompanionGuide) => void;
}

export function CompanionEditor({ companion, onSave }: CompanionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(companion.summary);

  const handleSave = () => {
    onSave({ ...companion, summary });
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(false)}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full"
          style={{
            background: !editing ? "var(--accent-gold)" : "var(--surface-1)",
            color: !editing ? "white" : "var(--muted)",
          }}
        >
          Preview
        </button>
        <button
          onClick={() => setEditing(true)}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full"
          style={{
            background: editing ? "var(--accent-gold)" : "var(--surface-1)",
            color: editing ? "white" : "var(--muted)",
          }}
        >
          Edit
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full text-sm rounded-lg px-3 py-2 resize-none"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>
              Full JSON (advanced)
            </label>
            <textarea
              defaultValue={JSON.stringify(companion, null, 2)}
              onBlur={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value) as CompanionGuide;
                  onSave(parsed);
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={12}
              className="w-full text-xs font-mono rounded-lg px-3 py-2 resize-y"
              style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
            />
          </div>

          <button
            onClick={handleSave}
            className="text-xs font-medium px-4 py-2 rounded-xl"
            style={{ background: "var(--accent-gold)", color: "white" }}
          >
            Save Changes
          </button>
        </div>
      ) : (
        <CompanionContent companion={{ ...companion, summary }} />
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {companion.hadiths.length} hadiths
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {companion.verses.length} verses
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {companion.actionItems.length} actions
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {companion.keyQuotes.length} quotes
        </span>
      </div>
    </div>
  );
}
