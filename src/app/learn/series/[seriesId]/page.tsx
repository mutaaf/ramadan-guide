"use client";

import { use } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useSeries, useSeriesEpisodes, useSeriesProgress, useSeriesUserActions } from "@/lib/series/hooks";
import { EpisodeCard } from "@/components/series/EpisodeCard";
import { SeriesProgress } from "@/components/series/SeriesProgress";

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = use(params);
  const { series, scholar, loading: indexLoading } = useSeries(seriesId);
  const { data: episodeData, loading: episodeLoading } = useSeriesEpisodes(seriesId);
  const progress = useSeriesProgress(seriesId);
  const { isCompleted, isBookmarked } = useSeriesUserActions();

  const loading = indexLoading || episodeLoading;

  return (
    <div>
      <PageHeader
        title={series?.title ?? "Loading..."}
        subtitle={scholar?.name}
        back="/learn/series"
      />

      <div className="px-6 pb-8 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
            />
          </div>
        )}

        {!loading && series && (
          <>
            {/* Series info */}
            <Card>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {series.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {series.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-1)", color: "var(--muted)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: "var(--muted)" }}>
                <span>{series.episodeCount} episodes</span>
                <span>{series.totalDuration}</span>
              </div>
            </Card>

            {/* Progress */}
            {progress.completed > 0 && (
              <Card>
                <SeriesProgress {...progress} />
              </Card>
            )}

            {/* Scholar info */}
            {scholar && (
              <Card>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--surface-1)", color: "var(--accent-gold)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[14px]">{scholar.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--muted)" }}>{scholar.title}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Episode list */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1"
                style={{ color: "var(--accent-gold)" }}
              >
                Episodes
              </p>
              <div className="space-y-2">
                {episodeData?.episodes.map((ep, i) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    delay={i * 0.05}
                    isCompleted={isCompleted(ep.id)}
                    isBookmarked={isBookmarked(ep.id)}
                    hasCompanion={!!episodeData.companions[ep.id]}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
