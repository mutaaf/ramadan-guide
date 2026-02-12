"use client";

import { PageHeader } from "@/components/PageHeader";
import { useSeriesIndex } from "@/lib/series/hooks";
import { useSeriesProgress } from "@/lib/series/hooks";
import { SeriesCard } from "@/components/series/SeriesCard";
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
      <div className="px-6 pb-8 space-y-2">
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
