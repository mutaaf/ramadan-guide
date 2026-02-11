"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import { ScholarForm } from "@/components/series/admin/ScholarForm";
import type { Scholar } from "@/lib/series/types";

export default function ScholarsPage() {
  const { scholars, addScholar, updateScholar, removeScholar } = useAdminStore();
  const [editing, setEditing] = useState<Scholar | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (scholar: Scholar) => {
    if (editing) {
      updateScholar(editing.id, scholar);
    } else {
      addScholar(scholar);
    }
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="px-6 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Scholars</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="text-xs font-medium px-3 py-2 rounded-xl"
          style={{ background: "var(--accent-gold)", color: "white" }}
        >
          + Add Scholar
        </button>
      </motion.div>

      {showForm && (
        <Card>
          <ScholarForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => { setEditing(null); setShowForm(false); }}
          />
        </Card>
      )}

      <div className="space-y-2">
        {scholars.map((scholar, i) => (
          <Card key={scholar.id} delay={i * 0.05}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{scholar.name}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{scholar.title}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(scholar); setShowForm(true); }}
                  className="text-xs px-2 py-1 rounded"
                  style={{ background: "var(--surface-1)" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => removeScholar(scholar.id)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {scholars.length === 0 && !showForm && (
        <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
          No scholars yet. Add your first scholar to get started.
        </p>
      )}
    </div>
  );
}
