"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import { ExportButton } from "@/components/series/admin/ExportButton";
import { PublishButton } from "@/components/series/admin/PublishButton";
import { SeriesForm } from "@/components/series/admin/SeriesForm";
import { computeAllReadiness } from "@/lib/series/publish-status";
import { computePublishDiff } from "@/lib/series/diff";
import type { Series } from "@/lib/series/types";

export default function AdminDashboardPage() {
  const { scholars, series, episodes, companions, lastPublishedSnapshot, addSeries, loadFromPublished } = useAdminStore();
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncFromLive = useCallback(async () => {
    setSyncing(true);
    try {
      await loadFromPublished();
    } finally {
      setSyncing(false);
    }
  }, [loadFromPublished]);

  // Auto-load from published if store is empty on mount
  useEffect(() => {
    if (series.length === 0 && scholars.length === 0) {
      handleSyncFromLive();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalEpisodes = Object.values(episodes).reduce((sum, eps) => sum + eps.length, 0);
  const totalCompanions = Object.keys(companions).length;

  const readiness = computeAllReadiness(series, episodes, companions);
  const diff = computePublishDiff({ series, episodes, companions }, lastPublishedSnapshot);

  const readinessColor = (r: { readyToPublish: boolean; episodesWithCompanions: number; totalEpisodes: number }) => {
    if (r.totalEpisodes === 0) return "var(--muted)";
    if (r.readyToPublish) return "#22c55e";
    if (r.episodesWithCompanions > 0) return "var(--accent-gold)";
    return "var(--muted)";
  };

  const handleCreateSeries = (data: Partial<Series>) => {
    const id = (data.title ?? "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const now = new Date().toISOString();
    addSeries({
      id,
      title: data.title ?? "",
      scholarId: data.scholarId ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      episodeCount: 0,
      totalDuration: data.totalDuration ?? "",
      status: data.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    });
    setShowCreateSeries(false);
  };

  return (
    <div className="px-6 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Series Admin</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Manage scholars, series, episodes, and AI companions
            </p>
          </div>
          <button
            onClick={handleSyncFromLive}
            disabled={syncing}
            className="text-xs font-medium px-3 py-1.5 rounded-xl shrink-0"
            style={{ background: "var(--surface-1)" }}
          >
            {syncing ? "Syncing..." : "Sync from Live"}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Scholars", value: scholars.length },
          { label: "Series", value: series.length },
          { label: "Episodes", value: totalEpisodes },
          { label: "Companions", value: totalCompanions },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05}>
            <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{stat.value}</p>
            <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Readiness */}
      {readiness.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Readiness
          </p>
          <div className="space-y-1.5">
            {readiness.map((r) => (
              <div key={r.seriesId} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--surface-1)" }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: readinessColor(r) }} />
                  <span className="text-xs font-medium">{r.seriesTitle}</span>
                </div>
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                  {r.episodesWithCompanions}/{r.totalEpisodes} companions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unpublished changes */}
      {diff.hasChanges && (
        <div className="rounded-xl p-3" style={{ background: "rgba(212, 168, 83, 0.08)", border: "1px solid rgba(212, 168, 83, 0.2)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
            Unpublished Changes
          </p>
          <div className="space-y-0.5">
            {diff.newSeries.length > 0 && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>{diff.newSeries.length} new series</p>
            )}
            {diff.updatedSeries.length > 0 && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>{diff.updatedSeries.length} updated series</p>
            )}
            {diff.newEpisodes.length > 0 && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>{diff.newEpisodes.length} new episodes</p>
            )}
            {diff.updatedEpisodes.length > 0 && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>{diff.updatedEpisodes.length} updated episodes</p>
            )}
            {diff.newCompanions.length > 0 && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>{diff.newCompanions.length} new companions</p>
            )}
            {diff.updatedCompanions.length > 0 && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>{diff.updatedCompanions.length} updated companions</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
            Manage
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/series/import"
              className="text-xs font-medium px-3 py-1.5 rounded-xl"
              style={{ background: "var(--surface-1)" }}
            >
              Import Playlist
            </Link>
            <button
              onClick={() => setShowCreateSeries(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl"
              style={{ background: "var(--accent-gold)", color: "white" }}
            >
              + New Series
            </button>
          </div>
        </div>

        {showCreateSeries && (
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
              Create Series
            </p>
            {scholars.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  You need to add a scholar first before creating a series.
                </p>
                <Link
                  href="/admin/series/scholars"
                  className="text-xs font-medium inline-block"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Go to Scholars &rarr;
                </Link>
              </div>
            ) : (
              <SeriesForm
                onSave={handleCreateSeries}
                onCancel={() => setShowCreateSeries(false)}
              />
            )}
          </Card>
        )}

        <Link href="/admin/series/scholars">
          <Card asLink className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Scholars</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {scholars.length} scholars registered
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Card>
        </Link>

        {series.map((sr) => {
          const r = readiness.find((x) => x.seriesId === sr.id);
          return (
            <Link key={sr.id} href={`/admin/series/${sr.id}`}>
              <Card asLink className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{sr.title}</p>
                    {r && (
                      <span className="w-2 h-2 rounded-full" style={{ background: readinessColor(r) }} />
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {(episodes[sr.id] ?? []).length} episodes &middot; {sr.status === "published" ? "live" : "hidden"}
                    {r && ` · ${r.episodesWithCompanions}/${r.totalEpisodes} companions`}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Card>
            </Link>
          );
        })}

        {series.length === 0 && !showCreateSeries && (
          <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>
            {syncing ? "Loading published series..." : "No series yet. Add a scholar, then create your first series."}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <PublishButton />
        <ExportButton />
      </div>
    </div>
  );
}
