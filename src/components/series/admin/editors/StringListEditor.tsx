"use client";

import { useState } from "react";

interface StringListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
}

export function StringListEditor({ items, onChange, label, placeholder }: StringListEditorProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const update = (idx: number, value: string) => {
    onChange(items.map((it, i) => (i === idx ? value : it)));
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
          {editIdx === i ? (
            <div className="flex gap-2 flex-1">
              <input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-xs rounded px-2 py-1"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") setEditIdx(null); }}
              />
              <button onClick={() => setEditIdx(null)} className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "var(--accent-gold)", color: "white" }}>Done</button>
            </div>
          ) : (
            <>
              <p className="text-xs flex-1 min-w-0 truncate">{item}</p>
              <button onClick={() => setEditIdx(i)} className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: "var(--card)" }}>Edit</button>
              <button onClick={() => remove(i)} className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ color: "#ef4444" }}>&#10005;</button>
            </>
          )}
        </div>
      ))}
      <button onClick={() => { onChange([...items, ""]); setEditIdx(items.length); }} className="text-[11px] font-medium px-3 py-1.5 rounded-lg w-full" style={{ border: "1px dashed var(--card-border)", color: "var(--muted)" }}>
        + Add {label}
      </button>
    </div>
  );
}
