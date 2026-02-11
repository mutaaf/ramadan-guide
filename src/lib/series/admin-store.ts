import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Scholar,
  Series,
  Episode,
  CompanionGuide,
  AdminGenerationStatus,
} from "./types";

interface SeriesAdminStore {
  // Editable data
  scholars: Scholar[];
  series: Series[];
  episodes: Record<string, Episode[]>; // keyed by seriesId
  companions: Record<string, CompanionGuide>; // keyed by episodeId

  // Generation status
  generationStatuses: Record<string, AdminGenerationStatus>;

  // Publish tracking
  lastPublishedAt: string | null;
  setLastPublishedAt: (timestamp: string) => void;

  // Scholar CRUD
  addScholar: (scholar: Scholar) => void;
  updateScholar: (id: string, data: Partial<Scholar>) => void;
  removeScholar: (id: string) => void;

  // Series CRUD
  addSeries: (series: Series) => void;
  updateSeries: (id: string, data: Partial<Series>) => void;
  removeSeries: (id: string) => void;

  // Episode CRUD
  addEpisode: (seriesId: string, episode: Episode) => void;
  updateEpisode: (seriesId: string, episodeId: string, data: Partial<Episode>) => void;
  removeEpisode: (seriesId: string, episodeId: string) => void;

  // Companion CRUD
  setCompanion: (episodeId: string, companion: CompanionGuide) => void;
  removeCompanion: (episodeId: string) => void;

  // Generation
  setGenerationStatus: (episodeId: string, status: AdminGenerationStatus) => void;
  clearGenerationStatus: (episodeId: string) => void;

  // Export
  exportToJSON: () => {
    index: { scholars: Scholar[]; series: Series[]; lastUpdated: string };
    seriesData: Record<string, { seriesId: string; episodes: Episode[]; companions: Record<string, CompanionGuide> }>;
  };

  // Import
  importIndex: (scholars: Scholar[], series: Series[]) => void;
  importSeriesData: (seriesId: string, episodes: Episode[], companions: Record<string, CompanionGuide>) => void;
}

export const useAdminStore = create<SeriesAdminStore>()(
  persist(
    (set, get) => ({
      scholars: [],
      series: [],
      episodes: {},
      companions: {},
      generationStatuses: {},
      lastPublishedAt: null,

      setLastPublishedAt: (timestamp) => set({ lastPublishedAt: timestamp }),

      addScholar: (scholar) =>
        set((s) => ({ scholars: [...s.scholars, scholar] })),

      updateScholar: (id, data) =>
        set((s) => ({
          scholars: s.scholars.map((sc) =>
            sc.id === id ? { ...sc, ...data } : sc
          ),
        })),

      removeScholar: (id) =>
        set((s) => ({ scholars: s.scholars.filter((sc) => sc.id !== id) })),

      addSeries: (series) =>
        set((s) => ({ series: [...s.series, series] })),

      updateSeries: (id, data) =>
        set((s) => ({
          series: s.series.map((sr) =>
            sr.id === id ? { ...sr, ...data } : sr
          ),
        })),

      removeSeries: (id) =>
        set((s) => ({
          series: s.series.filter((sr) => sr.id !== id),
          episodes: Object.fromEntries(
            Object.entries(s.episodes).filter(([key]) => key !== id)
          ),
        })),

      addEpisode: (seriesId, episode) =>
        set((s) => ({
          episodes: {
            ...s.episodes,
            [seriesId]: [...(s.episodes[seriesId] ?? []), episode],
          },
        })),

      updateEpisode: (seriesId, episodeId, data) =>
        set((s) => ({
          episodes: {
            ...s.episodes,
            [seriesId]: (s.episodes[seriesId] ?? []).map((ep) =>
              ep.id === episodeId ? { ...ep, ...data } : ep
            ),
          },
        })),

      removeEpisode: (seriesId, episodeId) =>
        set((s) => {
          const { [episodeId]: _, ...remainingCompanions } = s.companions;
          return {
            episodes: {
              ...s.episodes,
              [seriesId]: (s.episodes[seriesId] ?? []).filter(
                (ep) => ep.id !== episodeId
              ),
            },
            companions: remainingCompanions,
          };
        }),

      setCompanion: (episodeId, companion) =>
        set((s) => ({
          companions: { ...s.companions, [episodeId]: companion },
        })),

      removeCompanion: (episodeId) =>
        set((s) => {
          const { [episodeId]: _, ...rest } = s.companions;
          return { companions: rest };
        }),

      setGenerationStatus: (episodeId, status) =>
        set((s) => ({
          generationStatuses: { ...s.generationStatuses, [episodeId]: status },
        })),

      clearGenerationStatus: (episodeId) =>
        set((s) => {
          const { [episodeId]: _, ...rest } = s.generationStatuses;
          return { generationStatuses: rest };
        }),

      exportToJSON: () => {
        const state = get();
        const index = {
          scholars: state.scholars,
          series: state.series,
          lastUpdated: new Date().toISOString(),
        };

        const seriesData: Record<string, {
          seriesId: string;
          episodes: Episode[];
          companions: Record<string, CompanionGuide>;
        }> = {};

        for (const sr of state.series) {
          const eps = state.episodes[sr.id] ?? [];
          const comps: Record<string, CompanionGuide> = {};
          for (const ep of eps) {
            if (state.companions[ep.id]) {
              comps[ep.id] = state.companions[ep.id];
            }
          }
          seriesData[sr.id] = {
            seriesId: sr.id,
            episodes: eps,
            companions: comps,
          };
        }

        return { index, seriesData };
      },

      importIndex: (scholars, series) =>
        set({ scholars, series }),

      importSeriesData: (seriesId, episodes, companions) =>
        set((s) => ({
          episodes: { ...s.episodes, [seriesId]: episodes },
          companions: { ...s.companions, ...companions },
        })),
    }),
    {
      name: "series-admin-storage",
    }
  )
);
