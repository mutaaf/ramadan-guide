"use client";

import { useState } from "react";
import type { Scholar } from "@/lib/series/types";

interface ScholarFormProps {
  initial?: Scholar;
  onSave: (scholar: Scholar) => void;
  onCancel: () => void;
}

export function ScholarForm({ initial, onSave, onCancel }: ScholarFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [youtube, setYoutube] = useState(initial?.links?.youtube ?? "");
  const [website, setWebsite] = useState(initial?.links?.website ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = initial?.id ?? name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onSave({
      id,
      name,
      title,
      bio,
      links: {
        ...(youtube ? { youtube } : {}),
        ...(website ? { website } : {}),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        />
      </div>
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        />
      </div>
      <div>
        <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full text-sm rounded-lg px-3 py-2 resize-none"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>YouTube URL</label>
          <input
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Website URL</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="text-xs font-medium px-4 py-2 rounded-xl"
          style={{ background: "var(--accent-gold)", color: "white" }}
        >
          {initial ? "Update" : "Add"} Scholar
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
