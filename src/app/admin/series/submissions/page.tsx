"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { TranscriptInput } from "@/components/series/admin/TranscriptInput";
import { useAdminStore } from "@/lib/series/admin-store";
import type { LectureSubmission, SubmissionStatus } from "@/lib/submissions/types";

const TOKEN_KEY = "admin-token";
const TABS: { label: string; value: SubmissionStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

function getAdminToken() {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) ?? "" : "";
}

async function fetchSubmissions(status: string, token: string) {
  const res = await fetch(`/api/submissions?status=${status}&limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch submissions");
  return res.json() as Promise<{ submissions: LectureSubmission[]; count: number }>;
}

async function patchSubmission(id: string, data: Partial<LectureSubmission>, token: string) {
  const res = await fetch(`/api/submissions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update submission");
  return res.json();
}

async function deleteSubmission(id: string, token: string) {
  const res = await fetch(`/api/submissions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete submission");
}

async function generateCompanion(id: string, token: string) {
  const res = await fetch(`/api/submissions/${id}/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Generation failed");
  }
  return res.json();
}

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("pending");
  const [submissions, setSubmissions] = useState<LectureSubmission[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const { submissions: data, count } = await fetchSubmissions(activeTab, token);
      setSubmissions(data);
      setCounts((prev) => ({ ...prev, [activeTab]: count ?? data.length }));
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  // Also load counts for other tabs on mount
  useEffect(() => {
    const token = getAdminToken();
    for (const tab of TABS) {
      fetchSubmissions(tab.value, token)
        .then(({ count }) => setCounts((prev) => ({ ...prev, [tab.value]: count ?? 0 })))
        .catch(() => {});
    }
  }, []);

  const handleUpdate = async (id: string, data: Partial<LectureSubmission>) => {
    try {
      await patchSubmission(id, data, getAdminToken());
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    try {
      await deleteSubmission(id, getAdminToken());
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="px-6 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Review user-submitted lectures
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--surface-1)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setExpanded(null); }}
            className="flex-1 text-xs font-medium py-2 rounded-lg transition-colors"
            style={{
              background: activeTab === tab.value ? "var(--card)" : "transparent",
              color: activeTab === tab.value ? "var(--foreground)" : "var(--muted)",
              boxShadow: activeTab === tab.value ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
            {(counts[tab.value] ?? 0) > 0 && (
              <span className="ml-1 opacity-60">({counts[tab.value]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {/* Empty */}
      {!loading && submissions.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
          No {activeTab} submissions
        </p>
      )}

      {/* List */}
      {!loading && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {submissions.map((sub) => (
              <motion.div
                key={sub.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <SubmissionCard
                  submission={sub}
                  isExpanded={expanded === sub.id}
                  onToggle={() => setExpanded(expanded === sub.id ? null : sub.id)}
                  onUpdate={(data) => handleUpdate(sub.id, data)}
                  onDelete={() => handleDelete(sub.id)}
                  onReload={load}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Submission Card ────────────────────────────

interface SubmissionCardProps {
  submission: LectureSubmission;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (data: Partial<LectureSubmission>) => void;
  onDelete: () => void;
  onReload: () => void;
}

function SubmissionCard({ submission: sub, isExpanded, onToggle, onUpdate, onDelete, onReload }: SubmissionCardProps) {
  return (
    <Card>
      {/* Summary row */}
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex gap-3">
          {sub.thumbnail_url && (
            <img src={sub.thumbnail_url} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug line-clamp-1">{sub.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {sub.speaker_name && (
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>{sub.speaker_name}</span>
              )}
              <TranscriptBadge hasTranscript={!!sub.transcript} />
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
              {new Date(sub.submitted_at).toLocaleDateString()}
            </p>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="shrink-0 mt-1 transition-transform"
            style={{ color: "var(--muted)", transform: isExpanded ? "rotate(90deg)" : "none" }}
          >
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Expanded review panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ReviewPanel
              submission={sub}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReload={onReload}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function TranscriptBadge({ hasTranscript }: { hasTranscript: boolean }) {
  return (
    <span
      className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded"
      style={{
        background: hasTranscript ? "rgba(34,197,94,0.12)" : "rgba(251,146,60,0.12)",
        color: hasTranscript ? "#22c55e" : "#fb923c",
      }}
    >
      {hasTranscript ? "Transcript" : "No Transcript"}
    </span>
  );
}

// ── Review Panel ────────────────────────────

interface ReviewPanelProps {
  submission: LectureSubmission;
  onUpdate: (data: Partial<LectureSubmission>) => void;
  onDelete: () => void;
  onReload: () => void;
}

function ReviewPanel({ submission: sub, onUpdate, onDelete, onReload }: ReviewPanelProps) {
  const [notes, setNotes] = useState(sub.admin_notes ?? "");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showApprove, setShowApprove] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError("");
    try {
      await generateCompanion(sub.id, getAdminToken());
      onReload();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleTranscriptReady = async (transcript: string) => {
    await patchSubmission(sub.id, {
      transcript,
      transcript_source: "user_paste",
    } as Partial<LectureSubmission>, getAdminToken());
    onReload();
  };

  const handleReject = () => {
    onUpdate({
      status: "rejected",
      admin_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    } as Partial<LectureSubmission>);
  };

  return (
    <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid var(--card-border)" }}>
      {/* Video link */}
      <a
        href={sub.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium"
        style={{ color: "var(--accent-gold)" }}
      >
        Watch on YouTube &rarr;
      </a>

      {/* Description */}
      {sub.description && (
        <p className="text-xs" style={{ color: "var(--muted)" }}>{sub.description}</p>
      )}

      {/* Transcript section */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--accent-gold)" }}>
          Transcript
        </p>
        {sub.transcript ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <TranscriptBadge hasTranscript />
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-[10px] font-medium"
                style={{ color: "var(--accent-gold)" }}
              >
                {showTranscript ? "Hide" : "Show"} transcript
              </button>
            </div>
            {showTranscript && (
              <div
                className="text-xs max-h-40 overflow-y-auto rounded-lg p-2 mt-1"
                style={{ background: "var(--surface-1)", color: "var(--muted)" }}
              >
                {sub.transcript.slice(0, 3000)}
                {sub.transcript.length > 3000 && "..."}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <TranscriptBadge hasTranscript={false} />
            <TranscriptInput onTranscriptReady={handleTranscriptReady} />
          </div>
        )}
      </div>

      {/* Companion guide */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--accent-gold)" }}>
          Companion Guide
        </p>
        {sub.companion_guide ? (
          <div className="text-xs rounded-lg p-2" style={{ background: "rgba(34,197,94,0.06)" }}>
            <span className="font-medium" style={{ color: "#22c55e" }}>Generated</span>
            <span style={{ color: "var(--muted)" }}>
              {" "}&middot; {sub.companion_guide.themes?.length ?? 0} themes,{" "}
              {sub.companion_guide.actionItems?.length ?? 0} action items
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={handleGenerate}
              disabled={!sub.transcript || generating}
              className="text-xs font-medium px-3 py-1.5 rounded-xl disabled:opacity-40"
              style={{ background: "var(--accent-gold)", color: "white" }}
            >
              {generating ? "Generating..." : "Generate Companion"}
            </button>
            {!sub.transcript && (
              <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                Add a transcript first
              </p>
            )}
            {genError && (
              <p className="text-[10px]" style={{ color: "#ef4444" }}>{genError}</p>
            )}
          </div>
        )}
      </div>

      {/* Admin notes */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--accent-gold)" }}>
          Admin Notes
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes..."
          rows={2}
          className="w-full text-xs rounded-xl px-3 py-2 outline-none resize-none"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--card-border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      {/* Actions */}
      {(sub.status === "pending" || sub.status === "reviewing") && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setShowApprove(true)}
            disabled={!sub.transcript || !sub.companion_guide}
            className="flex-1 text-xs font-semibold py-2 rounded-xl disabled:opacity-40"
            style={{ background: "#22c55e", color: "white" }}
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            className="flex-1 text-xs font-semibold py-2 rounded-xl"
            style={{ background: "#ef4444", color: "white" }}
          >
            Reject
          </button>
          {sub.status === "pending" && (
            <button
              onClick={() => onUpdate({ status: "reviewing" } as Partial<LectureSubmission>)}
              className="text-xs font-medium px-3 py-2 rounded-xl"
              style={{ background: "var(--surface-1)" }}
            >
              Mark Reviewing
            </button>
          )}
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="text-[10px] font-medium"
        style={{ color: "#ef4444" }}
      >
        Delete submission
      </button>

      {/* Approve flow */}
      <AnimatePresence>
        {showApprove && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ApproveFlow
              submission={sub}
              adminNotes={notes}
              onClose={() => setShowApprove(false)}
              onApproved={onReload}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Approve Flow ────────────────────────────

interface ApproveFlowProps {
  submission: LectureSubmission;
  adminNotes: string;
  onClose: () => void;
  onApproved: () => void;
}

function ApproveFlow({ submission: sub, adminNotes, onClose, onApproved }: ApproveFlowProps) {
  const { scholars, series, episodes, addScholar, addSeries, addEpisode, setTranscript, setCompanion } = useAdminStore();

  const [scholarId, setScholarId] = useState("");
  const [newScholarName, setNewScholarName] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [episodeNum, setEpisodeNum] = useState(1);
  const [approving, setApproving] = useState(false);

  // Auto-suggest episode number when series changes
  useEffect(() => {
    if (seriesId && seriesId !== "__new__") {
      const eps = episodes[seriesId] ?? [];
      setEpisodeNum(eps.length + 1);
    }
  }, [seriesId, episodes]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      // Create scholar if new
      let finalScholarId = scholarId;
      if (scholarId === "__new__" && newScholarName.trim()) {
        finalScholarId = newScholarName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        addScholar({
          id: finalScholarId,
          name: newScholarName.trim(),
          title: "",
          bio: "",
          links: {},
        });
      }

      // Create series if new
      let finalSeriesId = seriesId;
      if (seriesId === "__new__" && newSeriesTitle.trim()) {
        finalSeriesId = newSeriesTitle.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const now = new Date().toISOString();
        addSeries({
          id: finalSeriesId,
          scholarId: finalScholarId,
          title: newSeriesTitle.trim(),
          description: "",
          tags: [],
          episodeCount: 0,
          totalDuration: "",
          status: "draft",
          createdAt: now,
          updatedAt: now,
        });
      }

      // Create episode
      const epId = `${finalSeriesId}-ep${episodeNum}`;
      addEpisode(finalSeriesId, {
        id: epId,
        seriesId: finalSeriesId,
        episodeNumber: episodeNum,
        title: sub.title,
        duration: sub.duration ?? "",
        youtubeUrl: sub.youtube_url,
      });

      // Set transcript
      if (sub.transcript) {
        setTranscript(epId, sub.transcript);
      }

      // Set companion
      if (sub.companion_guide) {
        setCompanion(epId, { ...sub.companion_guide, episodeId: epId });
      }

      // Update submission status in Supabase
      await patchSubmission(sub.id, {
        status: "approved",
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
        approved_series_id: finalSeriesId,
        approved_episode_id: epId,
      } as Partial<LectureSubmission>, getAdminToken());

      onApproved();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="mt-3 p-3 rounded-xl space-y-3" style={{ background: "var(--surface-1)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
        Approve &amp; Add to Series
      </p>

      {/* Scholar picker */}
      <div>
        <label className="block text-[10px] font-medium mb-1" style={{ color: "var(--muted)" }}>Scholar</label>
        <select
          value={scholarId}
          onChange={(e) => setScholarId(e.target.value)}
          className="w-full text-xs rounded-lg px-2 py-1.5 outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          <option value="">Select scholar...</option>
          {scholars.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="__new__">+ Create new scholar</option>
        </select>
        {scholarId === "__new__" && (
          <input
            type="text"
            value={newScholarName}
            onChange={(e) => setNewScholarName(e.target.value)}
            placeholder="Scholar name"
            className="w-full text-xs rounded-lg px-2 py-1.5 mt-1 outline-none"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        )}
      </div>

      {/* Series picker */}
      <div>
        <label className="block text-[10px] font-medium mb-1" style={{ color: "var(--muted)" }}>Series</label>
        <select
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
          className="w-full text-xs rounded-lg px-2 py-1.5 outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        >
          <option value="">Select series...</option>
          {series
            .filter((s) => !scholarId || scholarId === "__new__" || s.scholarId === scholarId)
            .map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          <option value="__new__">+ Create new series</option>
        </select>
        {seriesId === "__new__" && (
          <input
            type="text"
            value={newSeriesTitle}
            onChange={(e) => setNewSeriesTitle(e.target.value)}
            placeholder="Series title"
            className="w-full text-xs rounded-lg px-2 py-1.5 mt-1 outline-none"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        )}
      </div>

      {/* Episode number */}
      <div>
        <label className="block text-[10px] font-medium mb-1" style={{ color: "var(--muted)" }}>Episode #</label>
        <input
          type="number"
          value={episodeNum}
          onChange={(e) => setEpisodeNum(parseInt(e.target.value, 10) || 1)}
          min={1}
          className="w-20 text-xs rounded-lg px-2 py-1.5 outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={approving || (!scholarId || (scholarId === "__new__" && !newScholarName.trim())) || (!seriesId || (seriesId === "__new__" && !newSeriesTitle.trim()))}
          className="flex-1 text-xs font-semibold py-2 rounded-xl disabled:opacity-40"
          style={{ background: "#22c55e", color: "white" }}
        >
          {approving ? "Approving..." : "Confirm Approve"}
        </button>
        <button
          onClick={onClose}
          className="text-xs font-medium px-3 py-2 rounded-xl"
          style={{ background: "var(--card)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
