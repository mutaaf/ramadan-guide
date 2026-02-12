"use client";

import { useState } from "react";
import type { DiscussionQuestion } from "@/lib/series/types";

interface DiscussionQuestionEditorProps {
  items: DiscussionQuestion[];
  onChange: (items: DiscussionQuestion[]) => void;
}

export function DiscussionQuestionEditor({ items, onChange }: DiscussionQuestionEditorProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const update = (idx: number, field: keyof DiscussionQuestion, value: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [field]: value } : it));
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  return (
    <div className="space-y-2">
      {items.map((q, i) => (
        <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
          {editIdx === i ? (
            <>
              <textarea value={q.question} onChange={(e) => update(i, "question", e.target.value)} rows={2} placeholder="Discussion question..." className="w-full text-xs rounded px-2 py-1.5 resize-none" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} />
              <input value={q.context ?? ""} onChange={(e) => update(i, "context", e.target.value)} placeholder="Context (optional)" className="w-full text-xs rounded px-2 py-1.5" style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }} />
              <button onClick={() => setEditIdx(null)} className="text-[10px] font-medium px-2 py-1 rounded" style={{ background: "var(--accent-gold)", color: "white" }}>Done</button>
            </>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs line-clamp-2">{q.question}</p>
                {q.context && <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: "var(--muted)" }}>{q.context}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditIdx(i)} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--card)" }}>Edit</button>
                <button onClick={() => remove(i)} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "#ef4444" }}>&#10005;</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={() => { onChange([...items, { question: "" }]); setEditIdx(items.length); }} className="text-[11px] font-medium px-3 py-1.5 rounded-lg w-full" style={{ border: "1px dashed var(--card-border)", color: "var(--muted)" }}>
        + Add Question
      </button>
    </div>
  );
}
