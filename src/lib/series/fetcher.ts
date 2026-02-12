import type { SeriesIndex, SeriesEpisodeData } from "./types";

const cache = new Map<string, { data: unknown; fetchedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PUBLISH_TS_KEY = "series-last-published-at";

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_BASE_URL;

/**
 * Signal that data was just published.
 * Clears in-memory cache and writes a localStorage timestamp
 * so other tabs / future navigations also bypass stale data.
 */
export function invalidateSeriesCache() {
  cache.clear();
  if (typeof window !== "undefined") {
    localStorage.setItem(PUBLISH_TS_KEY, Date.now().toString());
  }
}

function getLastPublishTs(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(PUBLISH_TS_KEY) ?? "0");
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  // Expired by TTL
  if (Date.now() - entry.fetchedAt > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  // Stale because a publish happened after this was cached
  if (entry.fetchedAt < getLastPublishTs()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, fetchedAt: Date.now() });
}

async function fetchWithFallback<T>(blobPath: string, staticPath: string): Promise<T> {
  // Cache-bust query param to bypass browser/CDN HTTP cache after publish
  const bustParam = `?v=${getLastPublishTs() || "0"}`;

  // Try blob first if configured
  if (BLOB_BASE) {
    try {
      const res = await fetch(`${BLOB_BASE}/${blobPath}${bustParam}`, {
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Blob fetch failed, fall through to static
    }
  }

  // Fallback to static files
  const res = await fetch(`${staticPath}${bustParam}`, { cache: "no-store" });
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
