"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [descExpanded, setDescExpanded] = useState(false);

  const loading = indexLoading || episodeLoading;

  return (
    <div>
      <PageHeader
        title={series?.title ?? "Loading..."}
        subtitle={scholar?.name}
        back="/learn/series"
      />

      <div className="px-6 pb-8 space-y-3">
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
            {/* Compact series info: description + metadata + tags */}
            <div className="space-y-2">
              {/* Collapsible description */}
              <div>
                <AnimatePresence initial={false}>
                  {descExpanded ? (
                    <motion.p
                      key="full"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="text-[13px] leading-relaxed overflow-hidden"
                      style={{ color: "var(--muted)" }}
                    >
                      {series.description}
                    </motion.p>
                  ) : (
                    <p
                      className="text-[13px] leading-relaxed line-clamp-2"
                      style={{ color: "var(--muted)" }}
                    >
                      {series.description}
                    </p>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-[12px] font-medium mt-0.5"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {descExpanded ? "Show less" : "More"}
                </button>
              </div>

              {/* Inline scholar + metadata row */}
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px]" style={{ color: "var(--muted)" }}>
                {scholar && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "var(--surface-1)", color: "var(--accent-gold)" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>{scholar.name}</span>
                      <span>&middot; {scholar.title}</span>
                    </span>
                    <span style={{ color: "var(--surface-1)" }}>|</span>
                  </>
                )}
                <span>{series.episodeCount} episodes &middot; {series.totalDuration}</span>
              </div>

              {/* Tags row */}
              {series.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
              )}
            </div>

            {/* Progress */}
            {progress.completed > 0 && (
              <Card>
                <SeriesProgress {...progress} />
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
              <div className="space-y-3">
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
