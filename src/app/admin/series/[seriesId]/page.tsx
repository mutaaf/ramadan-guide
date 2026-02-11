"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import { SeriesForm } from "@/components/series/admin/SeriesForm";
import { EpisodeForm } from "@/components/series/admin/EpisodeForm";
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
    updateSeries,
    addEpisode,
    removeEpisode,
  } = useAdminStore();

  const series = allSeries.find((s) => s.id === seriesId);
  const seriesEpisodes = episodes[seriesId] ?? [];

  const [editingSeries, setEditingSeries] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);

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
    addEpisode(seriesId, episode);
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
            {series.status} &middot; {seriesEpisodes.length} episodes
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
        <button
          onClick={() => setShowEpisodeForm(true)}
          className="text-xs font-medium px-3 py-1.5 rounded-xl"
          style={{ background: "var(--accent-gold)", color: "white" }}
        >
          + Add Episode
        </button>
      </div>

      {showEpisodeForm && (
        <Card>
          <EpisodeForm
            seriesId={seriesId}
            episodeNumber={seriesEpisodes.length + 1}
            onSave={handleEpisodeSave}
            onCancel={() => setShowEpisodeForm(false)}
          />
        </Card>
      )}

      <div className="space-y-2">
        {seriesEpisodes.map((ep, i) => (
          <Link key={ep.id} href={`/admin/series/${seriesId}/${ep.id}`}>
            <Card asLink delay={i * 0.05}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--surface-1)", color: "var(--accent-gold)" }}
                  >
                    {ep.episodeNumber}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{ep.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]" style={{ color: "var(--muted)" }}>{ep.duration}</span>
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
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.preventDefault(); removeEpisode(seriesId, ep.id); }}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
                  >
                    Del
                  </button>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
