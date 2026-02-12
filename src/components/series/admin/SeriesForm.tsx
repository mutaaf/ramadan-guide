"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/series/admin-store";
import type { Series } from "@/lib/series/types";
import { validateRequired, type FieldErrors } from "@/lib/series/validation";

interface SeriesFormProps {
  initial?: Series;
  onSave: (data: Partial<Series>) => void;
  onCancel: () => void;
}

export function SeriesForm({ initial, onSave, onCancel }: SeriesFormProps) {
  const { scholars } = useAdminStore();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [scholarId, setScholarId] = useState(initial?.scholarId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "");
  const [totalDuration, setTotalDuration] = useState(initial?.totalDuration ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const e: FieldErrors = {
      title: validateRequired(title, "Title"),
      scholarId: validateRequired(scholarId, "Scholar"),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      title,
      scholarId,
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      totalDuration,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: `1px solid ${errors.title ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
        />
        {errors.title && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.title}</p>}
      </div>
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Scholar</label>
        <select
          value={scholarId}
          onChange={(e) => setScholarId(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: `1px solid ${errors.scholarId ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
        >
          <option value="">Select scholar...</option>
          {scholars.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.scholarId && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.scholarId}</p>}
      </div>
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full text-sm rounded-lg px-3 py-2 resize-none"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Total Duration</label>
          <input
            value={totalDuration}
            onChange={(e) => setTotalDuration(e.target.value)}
            placeholder="e.g. 3h 45m"
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          <option value="draft">Hidden</option>
          <option value="published">Live</option>
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="text-xs font-medium px-4 py-2 rounded-xl"
          style={{ background: "var(--accent-gold)", color: "white" }}
        >
          {initial ? "Update" : "Create"} Series
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
