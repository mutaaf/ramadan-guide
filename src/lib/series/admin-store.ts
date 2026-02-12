import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Scholar,
  Series,
  Episode,
  CompanionGuide,
  AdminGenerationStatus,
} from "./types";
import type { PublishSnapshot } from "./diff";

interface SeriesAdminStore {
  // Editable data
  scholars: Scholar[];
  series: Series[];
  episodes: Record<string, Episode[]>; // keyed by seriesId
  companions: Record<string, CompanionGuide>; // keyed by episodeId

  // Transcripts
  transcripts: Record<string, string>; // keyed by episodeId

  // Generation status
  generationStatuses: Record<string, AdminGenerationStatus>;

  // Publish tracking
  lastPublishedAt: string | null;
  lastPublishedSnapshot: PublishSnapshot | null;
  setLastPublishedAt: (timestamp: string) => void;
  setLastPublishedSnapshot: (snapshot: PublishSnapshot) => void;

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

  // Transcripts
  setTranscript: (episodeId: string, transcript: string) => void;
  clearTranscript: (episodeId: string) => void;

  // Generation
  setGenerationStatus: (episodeId: string, status: AdminGenerationStatus) => void;
  clearGenerationStatus: (episodeId: string) => void;

  // Renumber
  renumberEpisodes: (seriesId: string) => void;

  // Reorder
  reorderEpisode: (seriesId: string, episodeId: string, direction: "up" | "down") => void;

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
      transcripts: {},
      generationStatuses: {},
      lastPublishedAt: null,
      lastPublishedSnapshot: null,

      setLastPublishedAt: (timestamp) => set({ lastPublishedAt: timestamp }),

      setLastPublishedSnapshot: (snapshot) => set({ lastPublishedSnapshot: snapshot }),

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
        set((s) => {
          const episodeIds = (s.episodes[id] ?? []).map((ep) => ep.id);
          const companions = { ...s.companions };
          const transcripts = { ...s.transcripts };
          for (const epId of episodeIds) {
            delete companions[epId];
            delete transcripts[epId];
          }
          return {
            series: s.series.filter((sr) => sr.id !== id),
            episodes: Object.fromEntries(
              Object.entries(s.episodes).filter(([key]) => key !== id)
            ),
            companions,
            transcripts,
          };
        }),

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
          const { [episodeId]: _t, ...remainingTranscripts } = s.transcripts;
          const remaining = (s.episodes[seriesId] ?? []).filter(
            (ep) => ep.id !== episodeId
          );
          // Renumber sequentially to prevent gaps
          const renumbered = remaining.map((ep, i) => ({ ...ep, episodeNumber: i + 1 }));
          return {
            episodes: {
              ...s.episodes,
              [seriesId]: renumbered,
            },
            companions: remainingCompanions,
            transcripts: remainingTranscripts,
          };
        }),

      renumberEpisodes: (seriesId) =>
        set((s) => ({
          episodes: {
            ...s.episodes,
            [seriesId]: (s.episodes[seriesId] ?? []).map((ep, i) => ({
              ...ep,
              episodeNumber: i + 1,
            })),
          },
        })),

      reorderEpisode: (seriesId, episodeId, direction) =>
        set((s) => {
          const eps = [...(s.episodes[seriesId] ?? [])];
          const idx = eps.findIndex((ep) => ep.id === episodeId);
          if (idx === -1) return s;
          const swapIdx = direction === "up" ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= eps.length) return s;
          [eps[idx], eps[swapIdx]] = [eps[swapIdx], eps[idx]];
          // Update episode numbers to match new positions
          const updated = eps.map((ep, i) => ({ ...ep, episodeNumber: i + 1 }));
          return { episodes: { ...s.episodes, [seriesId]: updated } };
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

      setTranscript: (episodeId, transcript) =>
        set((s) => ({
          transcripts: { ...s.transcripts, [episodeId]: transcript },
        })),

      clearTranscript: (episodeId) =>
        set((s) => {
          const { [episodeId]: _, ...rest } = s.transcripts;
          return { transcripts: rest };
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
        const publishedSeries = state.series.filter((sr) => sr.status === "published");

        const seriesData: Record<string, {
          seriesId: string;
          episodes: Episode[];
          companions: Record<string, CompanionGuide>;
        }> = {};

        const indexSeries: Series[] = [];

        for (const sr of publishedSeries) {
          const eps = (state.episodes[sr.id] ?? []).filter((ep) => ep.status !== "draft");
          const comps: Record<string, CompanionGuide> = {};
          for (const ep of eps) {
            if (state.companions[ep.id]) {
              comps[ep.id] = state.companions[ep.id];
            }
          }
          // Update episodeCount to reflect only published episodes
          indexSeries.push({ ...sr, episodeCount: eps.length });
          seriesData[sr.id] = {
            seriesId: sr.id,
            episodes: eps,
            companions: comps,
          };
        }

        const index = {
          scholars: state.scholars,
          series: indexSeries,
          lastUpdated: new Date().toISOString(),
        };

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
