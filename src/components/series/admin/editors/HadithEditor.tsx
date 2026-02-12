"use client";

import { useState } from "react";
import type { ExtractedHadith } from "@/lib/series/types";

interface HadithEditorProps {
  items: ExtractedHadith[];
  onChange: (items: ExtractedHadith[]) => void;
}

const empty: ExtractedHadith = { text: "", source: "", narrator: "", context: "" };

export function HadithEditor({ items, onChange }: HadithEditorProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const update = (idx: number, field: keyof ExtractedHadith, value: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [field]: value } : it));
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  return (
    <div className="space-y-2">
      {items.map((h, i) => (
        <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
          {editIdx === i ? (
            <>
              <textarea value={h.text} onChange={(e) => update(i, "text", e.target.value)} rows={3} placeholder="Hadith text..." className="w-full text-xs rounded px-2 py-1.5 resize-none" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} />
              <div className="grid grid-cols-2 gap-2">
                <input value={h.source} onChange={(e) => update(i, "source", e.target.value)} placeholder="Source (e.g. Sahih Bukhari)" className="text-xs rounded px-2 py-1.5" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} />
                <input value={h.narrator ?? ""} onChange={(e) => update(i, "narrator", e.target.value)} placeholder="Narrator" className="text-xs rounded px-2 py-1.5" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} />
              </div>
              <textarea value={h.context} onChange={(e) => update(i, "context", e.target.value)} rows={2} placeholder="Context..." className="w-full text-xs rounded px-2 py-1.5 resize-none" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} />
              <button onClick={() => setEditIdx(null)} className="text-[10px] font-medium px-2 py-1 rounded" style={{ background: "var(--accent-gold)", color: "white" }}>Done</button>
            </>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs line-clamp-2">&ldquo;{h.text}&rdquo;</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{h.source}{h.narrator ? ` — ${h.narrator}` : ""}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditIdx(i)} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--card)" }}>Edit</button>
                <button onClick={() => remove(i)} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "#ef4444" }}>&#10005;</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={() => { onChange([...items, { ...empty }]); setEditIdx(items.length); }} className="text-[11px] font-medium px-3 py-1.5 rounded-lg w-full" style={{ border: "1px dashed var(--card-border)", color: "var(--muted)" }}>
        + Add Hadith
      </button>
    </div>
  );
}
