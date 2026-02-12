"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import { SeriesForm } from "@/components/series/admin/SeriesForm";
import { EpisodeForm } from "@/components/series/admin/EpisodeForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BulkTranscriptExtractor } from "@/components/series/admin/BulkTranscriptExtractor";
import { computeSeriesReadiness } from "@/lib/series/publish-status";
import { usePublish } from "@/lib/series/useAutoPublish";
import type { Series, Episode } from "@/lib/series/types";

export default function AdminSeriesDetailPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = use(params);
  const {
    series: allSeries,
    episodes,
    companions,
    transcripts,
    updateSeries,
    removeSeries,
    addEpisode,
    updateEpisode,
    removeEpisode,
    reorderEpisode,
    renumberEpisodes,
  } = useAdminStore();
  const router = useRouter();

  const series = allSeries.find((s) => s.id === seriesId);
  const seriesEpisodes = episodes[seriesId] ?? [];

  const [editingSeries, setEditingSeries] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Episode | null>(null);
  const [deleteSeriesOpen, setDeleteSeriesOpen] = useState(false);
  const { status: publishStatus, hasUnpublishedChanges, publishNow } = usePublish();

  // Auto-correct stale episode numbers (e.g. 1,4,5,6 → 1,2,3,4)
  useEffect(() => {
    const needsFix = seriesEpisodes.some((ep, i) => ep.episodeNumber !== i + 1);
    if (needsFix && seriesEpisodes.length > 0) {
      renumberEpisodes(seriesId);
    }
  }, [seriesId, seriesEpisodes, renumberEpisodes]);

  if (!series) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Series not found</p>
      </div>
    );
  }

  const handleSeriesSave = (data: Partial<Series>) => {
    updateSeries(seriesId, { ...data, updatedAt: new Date().toISOString() });
    setEditingSeries(false);
  };

  const handleEpisodeSave = (episode: Episode) => {
    if (editingEpisode) {
      updateEpisode(seriesId, episode.id, episode);
      setEditingEpisode(null);
    } else {
      addEpisode(seriesId, episode);
    }
    setShowEpisodeForm(false);
  };

  return (
    <div className="px-6 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <Link href="/admin/series" className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold mt-1">{series.title}</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {series.status === "published" ? "live" : "hidden"} &middot; {seriesEpisodes.length} episodes
          </p>
        </div>
        <button
          onClick={() => setEditingSeries(!editingSeries)}
          className="text-xs font-medium px-3 py-2 rounded-xl"
          style={{ background: "var(--surface-1)" }}
        >
          {editingSeries ? "Cancel" : "Edit Series"}
        </button>
      </motion.div>

      {/* Readiness bar */}
      {(() => {
        const readiness = computeSeriesReadiness(series, seriesEpisodes, companions);
        const pct = readiness.totalEpisodes > 0 ? (readiness.episodesWithCompanions / readiness.totalEpisodes) * 100 : 0;
        const missingEps = readiness.episodes.filter((e) => !e.hasCompanion);
        return (
          <div className="rounded-xl p-3" style={{ background: "var(--surface-1)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                Companion Coverage
              </p>
              <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
                {readiness.episodesWithCompanions}/{readiness.totalEpisodes} episodes
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? "#22c55e" : "var(--accent-gold)" }} />
            </div>
            {missingEps.length > 0 && (
              <div className="mt-2 space-y-1">
                {missingEps.map((ep) => (
                  <Link
                    key={ep.episodeId}
                    href={`/admin/series/${seriesId}/${ep.episodeId}`}
                    className="text-[11px] flex items-center gap-1.5"
                    style={{ color: "var(--muted)" }}
                  >
                    <span style={{ color: "#ef4444" }}>&#9679;</span>
                    {ep.episodeTitle}
                    <span className="ml-auto text-[10px]" style={{ color: "var(--accent-gold)" }}>Generate &rarr;</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Auto-publish status */}
      {publishStatus !== "idle" && (
        <div
          className="rounded-xl px-3 py-2 text-xs font-medium text-center"
          style={{
            background:
              publishStatus === "publishing" ? "rgba(212, 168, 83, 0.1)"
                : publishStatus === "published" ? "rgba(45, 212, 191, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
            color:
              publishStatus === "publishing" ? "var(--accent-gold)"
                : publishStatus === "published" ? "var(--accent-teal, #2dd4bf)"
                  : "#ef4444",
          }}
        >
          {publishStatus === "publishing" ? "Publishing changes..." : publishStatus === "published" ? "Published!" : "Publish failed"}
        </div>
      )}
      {hasUnpublishedChanges && publishStatus === "idle" && (
        <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
          <span className="text-xs font-medium" style={{ color: "#f59e0b" }}>Unpublished changes</span>
          <button
            onClick={publishNow}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(212, 168, 83, 0.15)", color: "var(--accent-gold)" }}
          >
            Publish Now
          </button>
        </div>
      )}

      {editingSeries && (
        <Card>
          <SeriesForm initial={series} onSave={handleSeriesSave} onCancel={() => setEditingSeries(false)} />
        </Card>
      )}

      {/* Episodes */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Episodes
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => renumberEpisodes(seriesId)}
            className="text-xs font-medium px-3 py-1.5 rounded-xl"
            style={{ background: "var(--surface-1)", color: "var(--muted)" }}
          >
            Renumber All
          </button>
          <button
            onClick={() => { setEditingEpisode(null); setShowEpisodeForm(true); }}
            className="text-xs font-medium px-3 py-1.5 rounded-xl"
            style={{ background: "var(--accent-gold)", color: "white" }}
          >
            + Add Episode
          </button>
        </div>
      </div>

      {(showEpisodeForm || editingEpisode) && (
        <Card>
          <EpisodeForm
            seriesId={seriesId}
            episodeNumber={editingEpisode?.episodeNumber ?? seriesEpisodes.length + 1}
            initial={editingEpisode ?? undefined}
            onSave={handleEpisodeSave}
            onCancel={() => { setShowEpisodeForm(false); setEditingEpisode(null); }}
          />
        </Card>
      )}

      <div className="space-y-3">
        {seriesEpisodes.map((ep, i) => {
          const isDraft = ep.status === "draft";
          return (
          <Card key={ep.id} delay={i * 0.05}>
            <div style={isDraft ? { opacity: 0.55 } : undefined}>
              {/* Top: Episode info (clickable) */}
              <Link href={`/admin/series/${seriesId}/${ep.id}`} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "var(--surface-1)", color: "var(--accent-gold)" }}
                >
                  {ep.episodeNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{ep.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: "var(--muted)" }}>{ep.duration}</span>
                    {isDraft && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                        Hidden
                      </span>
                    )}
                    {companions[ep.id] ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "rgba(45, 212, 191, 0.12)", color: "var(--accent-teal, #2dd4bf)" }}>
                        Guide Ready
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
                        No Guide
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              {/* Bottom: Action buttons */}
              <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
                <button
                  onClick={() => updateEpisode(seriesId, ep.id, { status: isDraft ? undefined : "draft" })}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: isDraft ? "rgba(245, 158, 11, 0.15)" : "var(--surface-1)", color: isDraft ? "#f59e0b" : "var(--muted)" }}
                >
                  {isDraft ? "Show" : "Hide"}
                </button>
                <button
                  onClick={() => reorderEpisode(seriesId, ep.id, "up")}
                  disabled={i === 0}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg disabled:opacity-30"
                  style={{ background: "var(--surface-1)", color: "var(--muted)" }}
                >
                  {"\u25B2 Up"}
                </button>
                <button
                  onClick={() => reorderEpisode(seriesId, ep.id, "down")}
                  disabled={i === seriesEpisodes.length - 1}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg disabled:opacity-30"
                  style={{ background: "var(--surface-1)", color: "var(--muted)" }}
                >
                  {"\u25BC Down"}
                </button>
                <button
                  onClick={() => { setEditingEpisode(ep); setShowEpisodeForm(false); }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: "var(--surface-1)", color: "var(--muted)" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(ep)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Bulk transcript extraction */}
      {seriesEpisodes.some((ep) => ep.youtubeUrl && !transcripts[ep.id]) && (
        <BulkTranscriptExtractor seriesId={seriesId} episodes={seriesEpisodes} />
      )}

      {/* Danger zone */}
      <div className="rounded-xl p-3 mt-4" style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#ef4444" }}>
          Danger Zone
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Permanently delete this series and all its episodes
          </p>
          <button
            onClick={() => setDeleteSeriesOpen(true)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg shrink-0 ml-3"
            style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
          >
            Delete Series
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Episode"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also remove its companion guide if one exists.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) removeEpisode(seriesId, deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={deleteSeriesOpen}
        title="Delete Series"
        message={`Are you sure you want to delete "${series.title}" and all ${seriesEpisodes.length} episodes? This cannot be undone.`}
        confirmLabel="Delete Series"
        variant="danger"
        onConfirm={() => {
          removeSeries(seriesId);
          router.push("/admin/series");
        }}
        onCancel={() => setDeleteSeriesOpen(false)}
      />
    </div>
  );
}
