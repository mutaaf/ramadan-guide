import type { Scholar, Series, Episode, CompanionGuide } from "./types";

export interface PublishSnapshot {
  index: {
    scholars: Scholar[];
    series: Series[];
  };
  seriesData: Record<
    string,
    {
      episodes: Episode[];
      companions: Record<string, CompanionGuide>;
    }
  >;
}

export interface PublishDiff {
  newSeries: string[];
  updatedSeries: string[];
  removedSeries: string[];
  newEpisodes: { seriesTitle: string; episodeTitle: string }[];
  updatedEpisodes: { seriesTitle: string; episodeTitle: string }[];
  removedEpisodes: { seriesTitle: string; episodeTitle: string }[];
  newCompanions: { episodeTitle: string }[];
  updatedCompanions: { episodeTitle: string }[];
  hasChanges: boolean;
}

export function computePublishDiff(
  current: {
    series: Series[];
    episodes: Record<string, Episode[]>;
    companions: Record<string, CompanionGuide>;
  },
  snapshot: PublishSnapshot | null
): PublishDiff {
  const diff: PublishDiff = {
    newSeries: [],
    updatedSeries: [],
    removedSeries: [],
    newEpisodes: [],
    updatedEpisodes: [],
    removedEpisodes: [],
    newCompanions: [],
    updatedCompanions: [],
    hasChanges: false,
  };

  if (!snapshot) {
    // Everything is new
    diff.newSeries = current.series.map((s) => s.title);
    for (const sr of current.series) {
      const eps = current.episodes[sr.id] ?? [];
      for (const ep of eps) {
        diff.newEpisodes.push({ seriesTitle: sr.title, episodeTitle: ep.title });
        if (current.companions[ep.id]) {
          diff.newCompanions.push({ episodeTitle: ep.title });
        }
      }
    }
    diff.hasChanges = diff.newSeries.length > 0 || diff.newEpisodes.length > 0;
    return diff;
  }

  const snapSeriesIds = new Set(snapshot.index.series.map((s) => s.id));
  const currentSeriesIds = new Set(current.series.map((s) => s.id));

  // Series diffs
  for (const sr of current.series) {
    if (!snapSeriesIds.has(sr.id)) {
      diff.newSeries.push(sr.title);
    } else {
      const snapSr = snapshot.index.series.find((s) => s.id === sr.id);
      if (snapSr && (snapSr.title !== sr.title || snapSr.description !== sr.description || snapSr.status !== sr.status)) {
        diff.updatedSeries.push(sr.title);
      }
    }
  }
  for (const sr of snapshot.index.series) {
    if (!currentSeriesIds.has(sr.id)) {
      diff.removedSeries.push(sr.title);
    }
  }

  // Episode + companion diffs
  for (const sr of current.series) {
    const currentEps = current.episodes[sr.id] ?? [];
    const snapEps = snapshot.seriesData[sr.id]?.episodes ?? [];
    const snapEpIds = new Set(snapEps.map((e) => e.id));
    const snapCompanions = snapshot.seriesData[sr.id]?.companions ?? {};

    for (const ep of currentEps) {
      if (!snapEpIds.has(ep.id)) {
        diff.newEpisodes.push({ seriesTitle: sr.title, episodeTitle: ep.title });
      } else {
        const snapEp = snapEps.find((e) => e.id === ep.id);
        if (snapEp && (snapEp.title !== ep.title || snapEp.duration !== ep.duration || snapEp.youtubeUrl !== ep.youtubeUrl || snapEp.episodeNumber !== ep.episodeNumber || snapEp.status !== ep.status)) {
          diff.updatedEpisodes.push({ seriesTitle: sr.title, episodeTitle: ep.title });
        }
      }

      // Companion diffs
      const currentComp = current.companions[ep.id];
      const snapComp = snapCompanions[ep.id];
      if (currentComp && !snapComp) {
        diff.newCompanions.push({ episodeTitle: ep.title });
      } else if (currentComp && snapComp && currentComp.generatedAt !== snapComp.generatedAt) {
        diff.updatedCompanions.push({ episodeTitle: ep.title });
      }
    }

    // Removed episodes
    const currentEpIds = new Set(currentEps.map((e) => e.id));
    for (const ep of snapEps) {
      if (!currentEpIds.has(ep.id)) {
        diff.removedEpisodes.push({ seriesTitle: sr.title, episodeTitle: ep.title });
      }
    }
  }

  diff.hasChanges =
    diff.newSeries.length > 0 ||
    diff.updatedSeries.length > 0 ||
    diff.removedSeries.length > 0 ||
    diff.newEpisodes.length > 0 ||
    diff.updatedEpisodes.length > 0 ||
    diff.removedEpisodes.length > 0 ||
    diff.newCompanions.length > 0 ||
    diff.updatedCompanions.length > 0;

  return diff;
}
