"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSeriesIndex, fetchSeriesEpisodes } from "./fetcher";
import type {
  SeriesIndex,
  SeriesEpisodeData,
  Series,
  Scholar,
  Episode,
  CompanionGuide,
} from "./types";
import { useStore } from "@/store/useStore";

export function useSeriesIndex() {
  const [data, setData] = useState<SeriesIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeriesIndex()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useSeriesEpisodes(seriesId: string | null) {
  const [data, setData] = useState<SeriesEpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSeriesEpisodes(seriesId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [seriesId]);

  return { data, loading, error };
}

export function useSeries(seriesId: string | null): {
  series: Series | null;
  scholar: Scholar | null;
  loading: boolean;
} {
  const { data, loading } = useSeriesIndex();
  if (!data || !seriesId) return { series: null, scholar: null, loading };
  const series = data.series.find((s) => s.id === seriesId) ?? null;
  const scholar = series
    ? data.scholars.find((s) => s.id === series.scholarId) ?? null
    : null;
  return { series, scholar, loading };
}

export function useEpisode(
  seriesId: string | null,
  episodeId: string | null
): {
  episode: Episode | null;
  companion: CompanionGuide | null;
  loading: boolean;
} {
  const { data, loading } = useSeriesEpisodes(seriesId);
  if (!data || !episodeId) return { episode: null, companion: null, loading };
  const episode = data.episodes.find((e) => e.id === episodeId) ?? null;
  const companion = data.companions[episodeId] ?? null;
  return { episode, companion, loading };
}

export function useSeriesProgress(seriesId: string) {
  const seriesUserData = useStore((s) => s.seriesUserData);
  const { data } = useSeriesEpisodes(seriesId);

  if (!data) return { completed: 0, total: 0, percentage: 0 };

  const total = data.episodes.length;
  const completed = data.episodes.filter(
    (e) => seriesUserData.completedEpisodes[e.id]
  ).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

export function useSeriesUserActions() {
  const toggleEpisodeComplete = useStore((s) => s.toggleEpisodeComplete);
  const toggleEpisodeBookmark = useStore((s) => s.toggleEpisodeBookmark);
  const setEpisodeNote = useStore((s) => s.setEpisodeNote);
  const setLastViewed = useStore((s) => s.setLastViewed);
  const seriesUserData = useStore((s) => s.seriesUserData);

  const isCompleted = useCallback(
    (episodeId: string) => !!seriesUserData.completedEpisodes[episodeId],
    [seriesUserData.completedEpisodes]
  );

  const isBookmarked = useCallback(
    (episodeId: string) => !!seriesUserData.bookmarkedEpisodes[episodeId],
    [seriesUserData.bookmarkedEpisodes]
  );

  const getNote = useCallback(
    (episodeId: string) => seriesUserData.episodeNotes[episodeId] ?? "",
    [seriesUserData.episodeNotes]
  );

  return {
    toggleEpisodeComplete,
    toggleEpisodeBookmark,
    setEpisodeNote,
    setLastViewed,
    isCompleted,
    isBookmarked,
    getNote,
    lastViewed: seriesUserData.lastViewed,
  };
}
