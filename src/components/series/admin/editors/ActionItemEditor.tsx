"use client";

import { useState } from "react";
import type { ActionItem } from "@/lib/series/types";

interface ActionItemEditorProps {
  items: ActionItem[];
  onChange: (items: ActionItem[]) => void;
}

const categories: ActionItem["category"][] = ["spiritual", "practical", "social", "study"];
const categoryColors: Record<string, string> = {
  spiritual: "var(--accent-gold)",
  practical: "#2dd4bf",
  social: "#60a5fa",
  study: "#a78bfa",
};

export function ActionItemEditor({ items, onChange }: ActionItemEditorProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const update = (idx: number, field: keyof ActionItem, value: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [field]: value } : it));
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  return (
    <div className="space-y-2">
      {items.map((a, i) => (
        <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
          {editIdx === i ? (
            <>
              <textarea value={a.text} onChange={(e) => update(i, "text", e.target.value)} rows={2} placeholder="Action item..." className="w-full text-xs rounded px-2 py-1.5 resize-none" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} />
              <select value={a.category} onChange={(e) => update(i, "category", e.target.value)} className="text-xs rounded px-2 py-1.5" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setEditIdx(null)} className="text-[10px] font-medium px-2 py-1 rounded" style={{ background: "var(--accent-gold)", color: "white" }}>Done</button>
            </>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: categoryColors[a.category] }} />
                <div className="min-w-0">
                  <p className="text-xs line-clamp-2">{a.text}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{a.category}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditIdx(i)} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--card)" }}>Edit</button>
                <button onClick={() => remove(i)} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "#ef4444" }}>&#10005;</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={() => { onChange([...items, { text: "", category: "spiritual" }]); setEditIdx(items.length); }} className="text-[11px] font-medium px-3 py-1.5 rounded-lg w-full" style={{ border: "1px dashed var(--card-border)", color: "var(--muted)" }}>
        + Add Action Item
      </button>
    </div>
  );
}
