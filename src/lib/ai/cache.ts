import { AIFeature, CacheEntry, FEATURE_TTL } from "./types";

const CACHE_KEY = "ramadan-ai-cache";
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAllEntries(): CacheEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CacheEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: CacheEntry[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
}

function getTotalSize(entries: CacheEntry[]): number {
  return entries.reduce((sum, e) => sum + e.size, 0);
}

function evictLRU(entries: CacheEntry[], neededBytes: number): CacheEntry[] {
  const sorted = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  let totalSize = getTotalSize(sorted);

  while (totalSize + neededBytes > MAX_CACHE_SIZE && sorted.length > 0) {
    const removed = sorted.shift()!;
    totalSize -= removed.size;
  }

  return sorted;
}

export class AICache {
  /** Remove expired entries — call on app load */
  static cleanup() {
    const now = Date.now();
    const entries = getAllEntries().filter(
      (e) => now - e.createdAt < e.ttl
    );
    saveEntries(entries);
  }

  /** Generate a content-addressable cache key */
  static async makeKey(
    feature: AIFeature,
    input: unknown
  ): Promise<string> {
    const payload = JSON.stringify({ feature, input });
    return sha256(payload);
  }

  /** Get a cached response (returns null if expired or missing) */
  static async get(
    feature: AIFeature,
    input: unknown
  ): Promise<string | null> {
    const key = await this.makeKey(feature, input);
    const entries = getAllEntries();
    const entry = entries.find((e) => e.key === key);

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.createdAt > entry.ttl) {
      // Expired — remove it
      saveEntries(entries.filter((e) => e.key !== key));
      return null;
    }

    return entry.data;
  }

  /** Store a response in cache with LRU eviction */
  static async set(
    feature: AIFeature,
    input: unknown,
    data: string
  ) {
    const key = await this.makeKey(feature, input);
    const size = new TextEncoder().encode(data).length;
    const ttl = FEATURE_TTL[feature];

    let entries = getAllEntries().filter((e) => e.key !== key);
    entries = evictLRU(entries, size);

    entries.push({
      key,
      feature,
      data,
      createdAt: Date.now(),
      ttl,
      size,
    });

    saveEntries(entries);
  }

  /** Clear all cached entries */
  static clear() {
    localStorage.removeItem(CACHE_KEY);
  }

  /** Clear entries for a specific feature */
  static clearFeature(feature: AIFeature) {
    const entries = getAllEntries().filter((e) => e.feature !== feature);
    saveEntries(entries);
  }

  /** Cache statistics */
  static getStats(): {
    totalEntries: number;
    totalSizeBytes: number;
    hitsByFeature: Record<string, number>;
  } {
    const entries = getAllEntries();
    const hitsByFeature: Record<string, number> = {};
    for (const e of entries) {
      hitsByFeature[e.feature] = (hitsByFeature[e.feature] ?? 0) + 1;
    }
    return {
      totalEntries: entries.length,
      totalSizeBytes: getTotalSize(entries),
      hitsByFeature,
    };
  }
}
