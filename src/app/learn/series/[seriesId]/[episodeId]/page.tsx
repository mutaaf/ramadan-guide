"use client";

import { use, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useSeries, useEpisode, useSeriesUserActions } from "@/lib/series/hooks";
import { CompanionContent } from "@/components/series/CompanionContent";
import { ProgressBadge } from "@/components/series/ProgressBadge";
import { EpisodeNotes } from "@/components/series/EpisodeNotes";
import { ShareButton } from "@/components/series/ShareButton";
import Link from "next/link";

export default function EpisodeCompanionPage({
  params,
}: {
  params: Promise<{ seriesId: string; episodeId: string }>;
}) {
  const { seriesId, episodeId } = use(params);
  const { series, scholar } = useSeries(seriesId);
  const { episode, companion, loading } = useEpisode(seriesId, episodeId);
  const {
    toggleEpisodeComplete,
    toggleEpisodeBookmark,
    isCompleted,
    isBookmarked,
    setLastViewed,
  } = useSeriesUserActions();

  const completed = isCompleted(episodeId);
  const bookmarked = isBookmarked(episodeId);

  // Track last viewed
  useEffect(() => {
    if (seriesId && episodeId) {
      setLastViewed(seriesId, episodeId);
    }
  }, [seriesId, episodeId, setLastViewed]);

  return (
    <div>
      <PageHeader
        title={episode?.title ?? "Loading..."}
        subtitle={series ? `${series.title} - Ep. ${episode?.episodeNumber ?? ""}` : undefined}
        back={`/learn/series/${seriesId}`}
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

        {!loading && episode && (
          <>
            {/* Episode meta + actions */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                    {episode.duration}
                  </span>
                  {scholar && (
                    <span className="text-[11px]" style={{ color: "var(--accent-gold)" }}>
                      {scholar.name}
                    </span>
                  )}
                  <ProgressBadge completed={completed} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleEpisodeComplete(episodeId)}
                  className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-xl transition-colors"
                  style={{
                    background: completed ? "var(--accent-gold)" : "var(--surface-1)",
                    color: completed ? "white" : "var(--foreground)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {completed ? "Completed" : "Mark Complete"}
                </button>

                <button
                  onClick={() => toggleEpisodeBookmark(episodeId)}
                  className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-xl transition-colors"
                  style={{ background: "var(--surface-1)" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={bookmarked ? "var(--accent-gold)" : "none"}
                    stroke={bookmarked ? "var(--accent-gold)" : "currentColor"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </button>

                <ShareButton
                  title={episode.title}
                  text={`${episode.title} - ${series?.title ?? ""}`}
                />

                {episode.youtubeUrl && (
                  <a
                    href={episode.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-xl"
                    style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch
                  </a>
                )}
              </div>
            </Card>

            {/* Companion guide */}
            {companion ? (
              <Card>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Companion Guide
                </p>
                <CompanionContent companion={companion} seriesId={seriesId} episodeId={episodeId} />
              </Card>
            ) : (
              <Card>
                <div className="text-center py-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2" style={{ color: "var(--muted)" }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <p className="text-sm font-medium">No companion guide yet</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    A guide will be generated for this episode soon.
                  </p>
                </div>
              </Card>
            )}

            {/* Notes */}
            <EpisodeNotes episodeId={episodeId} />

            {/* Back to Tracker */}
            <Link
              href="/tracker"
              className="flex items-center justify-center gap-2 text-[13px] font-medium px-4 py-2.5 rounded-xl transition-colors"
              style={{ background: "var(--surface-1)", color: "var(--muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Tracker
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
