"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
import { fetchSeriesIndex, fetchSeriesEpisodes } from "@/lib/series/fetcher";
import { EpisodeCard } from "@/components/series/EpisodeCard";
import type { Episode, SeriesIndex, SeriesEpisodeData } from "@/lib/series/types";

export default function BookmarksPage() {
  const seriesUserData = useStore((s) => s.seriesUserData);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [companionMap, setCompanionMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const bookmarkedIds = Object.entries(seriesUserData.bookmarkedEpisodes)
    .filter(([, v]) => v)
    .map(([k]) => k);

  useEffect(() => {
    if (bookmarkedIds.length === 0) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const index: SeriesIndex = await fetchSeriesIndex();
        const allEpisodes: Episode[] = [];
        const compMap: Record<string, boolean> = {};

        for (const series of index.series) {
          const data: SeriesEpisodeData = await fetchSeriesEpisodes(series.id);
          for (const ep of data.episodes) {
            if (bookmarkedIds.includes(ep.id)) {
              allEpisodes.push(ep);
              compMap[ep.id] = !!data.companions[ep.id];
            }
          }
        }
        setEpisodes(allEpisodes);
        setCompanionMap(compMap);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkedIds.length]);

  return (
    <div>
      <PageHeader title="Bookmarks" subtitle="Your saved episodes" back="/learn/series" />
      <div className="px-6 pb-8 space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
            />
          </div>
        )}
        {!loading && episodes.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
            No bookmarked episodes yet. Bookmark episodes from any series to find them here.
          </p>
        )}
        {episodes.map((ep, i) => (
          <EpisodeCard
            key={ep.id}
            episode={ep}
            delay={i * 0.05}
            isCompleted={!!seriesUserData.completedEpisodes[ep.id]}
            isBookmarked={true}
            hasCompanion={companionMap[ep.id]}
          />
        ))}
      </div>
    </div>
  );
}
