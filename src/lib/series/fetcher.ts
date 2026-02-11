import type { SeriesIndex, SeriesEpisodeData } from "./types";

const cache = new Map<string, { data: unknown; fetchedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_BASE_URL;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, fetchedAt: Date.now() });
}

async function fetchWithFallback<T>(blobPath: string, staticPath: string): Promise<T> {
  // Try blob first if configured
  if (BLOB_BASE) {
    try {
      const res = await fetch(`${BLOB_BASE}/${blobPath}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Blob fetch failed, fall through to static
    }
  }

  // Fallback to static files
  const res = await fetch(staticPath);
  if (!res.ok) throw new Error(`Failed to load ${staticPath}`);
  return await res.json();
}

export async function fetchSeriesIndex(): Promise<SeriesIndex> {
  const cacheKey = "series-index";
  const cached = getCached<SeriesIndex>(cacheKey);
  if (cached) return cached;

  const data = await fetchWithFallback<SeriesIndex>(
    "series/series-index.json",
    "/data/series/series-index.json"
  );
  setCache(cacheKey, data);
  return data;
}

export async function fetchSeriesEpisodes(seriesId: string): Promise<SeriesEpisodeData> {
  const cacheKey = `series-episodes-${seriesId}`;
  const cached = getCached<SeriesEpisodeData>(cacheKey);
  if (cached) return cached;

  const data = await fetchWithFallback<SeriesEpisodeData>(
    `series/${seriesId}/episodes.json`,
    `/data/series/${seriesId}/episodes.json`
  );
  setCache(cacheKey, data);
  return data;
}
