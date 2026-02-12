import type { Series, Episode, CompanionGuide } from "./types";

export interface EpisodeReadiness {
  episodeId: string;
  episodeTitle: string;
  hasCompanion: boolean;
  hasYoutubeUrl: boolean;
  isReady: boolean;
}

export interface SeriesReadiness {
  seriesId: string;
  seriesTitle: string;
  status: "draft" | "published";
  totalEpisodes: number;
  episodesWithCompanions: number;
  episodes: EpisodeReadiness[];
  readyToPublish: boolean;
}

export function computeSeriesReadiness(
  series: Series,
  episodes: Episode[],
  companions: Record<string, CompanionGuide>
): SeriesReadiness {
  const epReadiness: EpisodeReadiness[] = episodes.map((ep) => ({
    episodeId: ep.id,
    episodeTitle: ep.title,
    hasCompanion: !!companions[ep.id],
    hasYoutubeUrl: !!ep.youtubeUrl,
    isReady: !!companions[ep.id] && !!ep.youtubeUrl,
  }));

  const episodesWithCompanions = epReadiness.filter((e) => e.hasCompanion).length;

  return {
    seriesId: series.id,
    seriesTitle: series.title,
    status: series.status,
    totalEpisodes: episodes.length,
    episodesWithCompanions,
    episodes: epReadiness,
    readyToPublish: episodes.length > 0 && episodesWithCompanions === episodes.length,
  };
}

export function computeAllReadiness(
  allSeries: Series[],
  allEpisodes: Record<string, Episode[]>,
  companions: Record<string, CompanionGuide>
): SeriesReadiness[] {
  return allSeries.map((series) =>
    computeSeriesReadiness(series, allEpisodes[series.id] ?? [], companions)
  );
}
