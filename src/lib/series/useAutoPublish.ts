"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAdminStore } from "./admin-store";
import { computePublishDiff } from "./diff";
import { invalidateSeriesCache } from "./fetcher";

const TOKEN_STORAGE_KEY = "admin-token";

export type PublishStatus = "idle" | "publishing" | "published" | "error";

export function usePublish() {
  const series = useAdminStore((s) => s.series);
  const episodes = useAdminStore((s) => s.episodes);
  const companions = useAdminStore((s) => s.companions);
  const exportToJSON = useAdminStore((s) => s.exportToJSON);
  const setLastPublishedAt = useAdminStore((s) => s.setLastPublishedAt);
  const setLastPublishedSnapshot = useAdminStore((s) => s.setLastPublishedSnapshot);
  const lastPublishedSnapshot = useAdminStore((s) => s.lastPublishedSnapshot);

  const [status, setStatus] = useState<PublishStatus>("idle");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const publish = useCallback(async () => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_STORAGE_KEY)
      : null;
    if (!token) return;

    if (!mountedRef.current) return;
    setStatus("publishing");

    try {
      const data = exportToJSON();
      const res = await fetch("/api/series/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const result = await res.json();
      if (!mountedRef.current) return;

      setLastPublishedAt(result.publishedAt);
      setLastPublishedSnapshot({
        index: { scholars: data.index.scholars, series: data.index.series },
        seriesData: Object.fromEntries(
          Object.entries(data.seriesData).map(([id, sd]) => [
            id,
            { episodes: sd.episodes, companions: sd.companions },
          ])
        ),
      });

      // Bust the fetcher cache so user-facing pages get fresh data
      invalidateSeriesCache();

      setStatus("published");
      setTimeout(() => {
        if (mountedRef.current) setStatus("idle");
      }, 3000);
    } catch {
      if (mountedRef.current) {
        setStatus("error");
        setTimeout(() => {
          if (mountedRef.current) setStatus("idle");
        }, 4000);
      }
    }
  }, [exportToJSON, setLastPublishedAt, setLastPublishedSnapshot]);

  const diff = computePublishDiff({ series, episodes, companions }, lastPublishedSnapshot);

  return { status, hasUnpublishedChanges: diff.hasChanges, publishNow: publish };
}
