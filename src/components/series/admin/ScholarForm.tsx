"use client";

import { useState } from "react";
import type { Scholar } from "@/lib/series/types";
import { validateRequired, validateUrl, type FieldErrors } from "@/lib/series/validation";

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
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const e: FieldErrors = {
      name: validateRequired(name, "Name"),
      title: validateRequired(title, "Title"),
      youtube: validateUrl(youtube),
      website: validateUrl(website),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
          className="w-full text-sm rounded-lg px-3 py-2"
          style={{ background: "var(--surface-1)", border: `1px solid ${errors.name ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
        />
        {errors.name && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.name}</p>}
      </div>
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
            style={{ background: "var(--surface-1)", border: `1px solid ${errors.youtube ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
          />
          {errors.youtube && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.youtube}</p>}
        </div>
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Website URL</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{ background: "var(--surface-1)", border: `1px solid ${errors.website ? "#ef4444" : "var(--card-border)"}`, color: "var(--foreground)" }}
          />
          {errors.website && <p className="text-[11px] mt-0.5" style={{ color: "#ef4444" }}>{errors.website}</p>}
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
