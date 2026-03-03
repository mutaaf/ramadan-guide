"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { useSeriesIndex } from "@/lib/series/hooks";
import { useSeriesProgress } from "@/lib/series/hooks";
import { SeriesCard } from "@/components/series/SeriesCard";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Series } from "@/lib/series/types";

function SeriesCardWithProgress({ series, scholar, delay }: {
  series: Series;
  scholar?: { id: string; name: string; title: string; bio: string; links: { youtube?: string; website?: string } };
  delay: number;
}) {
  const progress = useSeriesProgress(series.id);
  return <SeriesCard series={series} scholar={scholar} delay={delay} progress={progress} />;
}

export default function SeriesBrowsePage() {
  const { data, loading, error } = useSeriesIndex();

  const publishedSeries = data?.series.filter((s) => s.status === "published") ?? [];

  return (
    <div>
      <PageHeader title="Series Companion" subtitle="AI-powered lecture guides" back="/learn" />
      <div className="px-6 pb-8 space-y-3">
        {isSupabaseConfigured() && (
          <Link
            href="/learn/series/submit"
            className="flex items-center justify-between rounded-2xl p-3 transition-opacity active:opacity-80"
            style={{
              background: "rgba(212, 168, 83, 0.08)",
              border: "1px solid rgba(212, 168, 83, 0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">&#128218;</span>
              <span className="text-sm font-medium">Suggest a Lecture</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--accent-gold)" }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        )}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
            />
          </div>
        )}
        {error && (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
            {error}
          </p>
        )}
        {!loading && publishedSeries.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
            No series available yet.
          </p>
        )}
        {publishedSeries.map((series, i) => {
          const scholar = data?.scholars.find((s) => s.id === series.scholarId);
          return (
            <SeriesCardWithProgress
              key={series.id}
              series={series}
              scholar={scholar}
              delay={i * 0.08}
            />
          );
        })}
      </div>
    </div>
  );
}
