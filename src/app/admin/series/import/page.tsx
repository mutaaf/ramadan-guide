"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import { validatePlaylistUrl } from "@/lib/series/validation";
import type { Series } from "@/lib/series/types";

interface PlaylistVideo {
  videoId: string;
  title: string;
  duration: string;
  youtubeUrl: string;
  position: number;
}

interface PlaylistData {
  title: string;
  description: string;
  channelName: string;
  videoCount: number;
  videos: PlaylistVideo[];
  partial?: boolean;
}

type Step = 1 | 2 | 3 | 4;

function parseDurationToSeconds(d: string): number {
  const parts = d.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function generateSeriesId(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function ImportPlaylistPage() {
  const router = useRouter();
  const { scholars, series: existingSeries, addScholar, addSeries, addEpisode } = useAdminStore();

  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Step 2
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  // Step 3
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesDescription, setSeriesDescription] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [newScholarName, setNewScholarName] = useState("");
  const [showNewScholar, setShowNewScholar] = useState(false);
  const [tags, setTags] = useState("");

  // Step 4
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const [newSeriesId, setNewSeriesId] = useState("");

  // Step 1: Extract playlist
  const handleExtract = async () => {
    const err = validatePlaylistUrl(playlistUrl);
    if (err) {
      setUrlError(err);
      return;
    }
    setUrlError(null);
    setFetchError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/series/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.error ?? "Failed to fetch playlist");
        return;
      }
      const pl = data.playlist as PlaylistData;
      setPlaylist(pl);
      setSelectedVideos(new Set(pl.videos.map((v) => v.videoId)));
      setSeriesTitle(pl.title);
      setSeriesDescription(pl.description);
      setStep(2);
    } catch {
      setFetchError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Toggle video selection
  const toggleVideo = (videoId: string) => {
    setSelectedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const toggleAll = () => {
    if (!playlist) return;
    if (selectedVideos.size === playlist.videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(playlist.videos.map((v) => v.videoId)));
    }
  };

  // Step 3: selected video stats
  const selectedVideoList = playlist?.videos.filter((v) => selectedVideos.has(v.videoId)) ?? [];
  const totalSeconds = selectedVideoList.reduce(
    (sum, v) => sum + parseDurationToSeconds(v.duration),
    0
  );

  // Step 4: Import
  const handleImport = async () => {
    if (!playlist) return;

    let resolvedScholarId = scholarId;

    // Create new scholar if needed
    if (showNewScholar && newScholarName.trim()) {
      const sid = newScholarName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      addScholar({
        id: sid,
        name: newScholarName.trim(),
        title: "",
        bio: "",
        links: {},
      });
      resolvedScholarId = sid;
    }

    const sid = generateSeriesId(seriesTitle || playlist.title);
    setNewSeriesId(sid);

    const videos = selectedVideoList;
    setImportTotal(videos.length);
    setImportProgress(0);
    setStep(4);

    const now = new Date().toISOString();
    const newSeries: Series = {
      id: sid,
      scholarId: resolvedScholarId,
      title: seriesTitle || playlist.title,
      description: seriesDescription,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      episodeCount: videos.length,
      totalDuration: formatTotalDuration(totalSeconds),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    addSeries(newSeries);

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const epNum = i + 1;
      const episodeId = `${sid}-ep-${String(epNum).padStart(2, "0")}`;

      addEpisode(sid, {
        id: episodeId,
        seriesId: sid,
        episodeNumber: epNum,
        title: video.title,
        duration: video.duration,
        youtubeUrl: video.youtubeUrl,
      });

      setImportProgress(epNum);
      // Small delay for UI feedback
      await new Promise((r) => setTimeout(r, 30));
    }

    setImportDone(true);
  };

  return (
    <div className="px-6 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/admin/series" className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold mt-1">Import Playlist</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Import a YouTube playlist as a series with episodes
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background: s <= step ? "var(--accent-gold)" : "var(--surface-1)",
            }}
          />
        ))}
      </div>

      {/* Step 1: Paste URL */}
      {step === 1 && (
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Step 1 &mdash; Playlist URL
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={playlistUrl}
              onChange={(e) => {
                setPlaylistUrl(e.target.value);
                setUrlError(null);
                setFetchError(null);
              }}
              placeholder="https://www.youtube.com/playlist?list=PL..."
              className="w-full text-sm rounded-xl px-4 py-3 outline-none"
              style={{
                background: "var(--surface-1)",
                border: urlError ? "1px solid #ef4444" : "1px solid var(--card-border)",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleExtract()}
            />
            {urlError && <p className="text-xs" style={{ color: "#ef4444" }}>{urlError}</p>}
            {fetchError && <p className="text-xs" style={{ color: "#ef4444" }}>{fetchError}</p>}
            <button
              onClick={handleExtract}
              disabled={loading || !playlistUrl.trim()}
              className="w-full text-sm font-medium px-4 py-3 rounded-xl transition-opacity disabled:opacity-50"
              style={{ background: "var(--accent-gold)", color: "white" }}
            >
              {loading ? "Extracting..." : "Extract Playlist"}
            </button>
          </div>
        </Card>
      )}

      {/* Step 2: Review Videos */}
      {step === 2 && playlist && (
        <>
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
              Step 2 &mdash; Review Videos
            </p>
            <p className="font-semibold text-sm">{playlist.title}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {playlist.channelName} &middot; {playlist.videoCount} videos
            </p>
            {playlist.partial && (
              <p className="text-xs mt-1" style={{ color: "#f59e0b" }}>
                Note: Some videos may be missing due to playlist size limits.
              </p>
            )}
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              {selectedVideos.size} of {playlist.videos.length} selected
            </p>
            <button
              onClick={toggleAll}
              className="text-xs font-medium px-3 py-1.5 rounded-xl"
              style={{ background: "var(--surface-1)" }}
            >
              {selectedVideos.size === playlist.videos.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto rounded-xl" style={{ background: "var(--surface-1)" }}>
            {playlist.videos.map((video) => (
              <label
                key={video.videoId}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <input
                  type="checkbox"
                  checked={selectedVideos.has(video.videoId)}
                  onChange={() => toggleVideo(video.videoId)}
                  className="shrink-0 accent-[--accent-gold]"
                />
                <span className="text-xs font-medium shrink-0 w-6 text-center" style={{ color: "var(--muted)" }}>
                  {video.position}
                </span>
                <span className="text-sm flex-1 min-w-0 truncate">{video.title}</span>
                <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>
                  {video.duration}
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 text-sm font-medium px-4 py-3 rounded-xl"
              style={{ background: "var(--surface-1)" }}
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedVideos.size === 0}
              className="flex-1 text-sm font-medium px-4 py-3 rounded-xl transition-opacity disabled:opacity-50"
              style={{ background: "var(--accent-gold)", color: "white" }}
            >
              Configure Series
            </button>
          </div>
        </>
      )}

      {/* Step 3: Configure Series */}
      {step === 3 && playlist && (
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Step 3 &mdash; Configure Series
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Title</label>
              <input
                type="text"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Description</label>
              <textarea
                value={seriesDescription}
                onChange={(e) => setSeriesDescription(e.target.value)}
                rows={3}
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none resize-none"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Scholar</label>
              {!showNewScholar ? (
                <div className="space-y-2">
                  <select
                    value={scholarId}
                    onChange={(e) => setScholarId(e.target.value)}
                    className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
                  >
                    <option value="">Select a scholar...</option>
                    {scholars.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setShowNewScholar(true);
                      setNewScholarName(playlist.channelName);
                    }}
                    className="text-xs font-medium"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    + Create new scholar from &ldquo;{playlist.channelName}&rdquo;
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newScholarName}
                    onChange={(e) => setNewScholarName(e.target.value)}
                    placeholder="Scholar name"
                    className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
                    style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
                  />
                  <button
                    onClick={() => setShowNewScholar(false)}
                    className="text-xs font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Use existing scholar instead
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. tafsir, quran, hadith"
                className="w-full text-sm rounded-xl px-4 py-2.5 outline-none"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              />
            </div>

            <div className="rounded-xl p-3" style={{ background: "var(--surface-1)" }}>
              <p className="text-xs font-medium">
                {selectedVideos.size} episodes selected &middot; Total duration: {formatTotalDuration(totalSeconds)}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                Status: Draft
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 text-sm font-medium px-4 py-3 rounded-xl"
                style={{ background: "var(--surface-1)" }}
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={!seriesTitle.trim() || (!scholarId && (!showNewScholar || !newScholarName.trim()))}
                className="flex-1 text-sm font-medium px-4 py-3 rounded-xl transition-opacity disabled:opacity-50"
                style={{ background: "var(--accent-gold)", color: "white" }}
              >
                Import Series
              </button>
            </div>

            {/* ID collision warning */}
            {seriesTitle.trim() &&
              existingSeries.some((s) => s.id === generateSeriesId(seriesTitle)) && (
                <p className="text-xs" style={{ color: "#ef4444" }}>
                  A series with this ID already exists. Change the title to avoid conflicts.
                </p>
              )}
          </div>
        </Card>
      )}

      {/* Step 4: Import Progress */}
      {step === 4 && (
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Step 4 &mdash; {importDone ? "Complete" : "Importing"}
          </p>

          <div className="space-y-3">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: importTotal > 0 ? `${(importProgress / importTotal) * 100}%` : "0%",
                  background: importDone ? "#22c55e" : "var(--accent-gold)",
                }}
              />
            </div>
            <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
              {importDone
                ? `Imported ${importProgress} episodes successfully`
                : `Importing episode ${importProgress} of ${importTotal}...`}
            </p>

            {importDone && (
              <button
                onClick={() => router.push(`/admin/series/${newSeriesId}`)}
                className="w-full text-sm font-medium px-4 py-3 rounded-xl"
                style={{ background: "var(--accent-gold)", color: "white" }}
              >
                View Series &rarr;
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
