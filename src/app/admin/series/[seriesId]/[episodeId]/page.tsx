"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import { TranscriptInput } from "@/components/series/admin/TranscriptInput";
import { GenerationProgress } from "@/components/series/admin/GenerationProgress";
import { CompanionEditor } from "@/components/series/admin/CompanionEditor";

export default function AdminEpisodeEditorPage({
  params,
}: {
  params: Promise<{ seriesId: string; episodeId: string }>;
}) {
  const { seriesId, episodeId } = use(params);
  const {
    series: allSeries,
    scholars,
    episodes,
    companions,
    generationStatuses,
    setCompanion,
    setGenerationStatus,
    clearGenerationStatus,
  } = useAdminStore();

  const series = allSeries.find((s) => s.id === seriesId);
  const seriesEpisodes = episodes[seriesId] ?? [];
  const episode = seriesEpisodes.find((e) => e.id === episodeId);
  const companion = companions[episodeId] ?? null;
  const genStatus = generationStatuses[episodeId] ?? null;
  const scholar = series ? scholars.find((s) => s.id === series.scholarId) : null;

  if (!series || !episode) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Episode not found</p>
      </div>
    );
  }

  const handleGenerate = async (transcript: string) => {
    setGenerationStatus(episodeId, {
      episodeId,
      status: "analyzing",
      progress: 30,
    });

    try {
      const res = await fetch("/api/series/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          scholarName: scholar?.name ?? "Unknown Scholar",
          seriesTitle: series.title,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.title,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      setGenerationStatus(episodeId, {
        episodeId,
        status: "complete",
        progress: 100,
        transcript,
      });

      const data = await res.json();
      const generatedCompanion = {
        ...data.companion,
        episodeId,
      };
      setCompanion(episodeId, generatedCompanion);
      setGenerationStatus(episodeId, {
        episodeId,
        status: "complete",
        progress: 100,
        transcript,
        companion: generatedCompanion,
      });
    } catch (err) {
      setGenerationStatus(episodeId, {
        episodeId,
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <div className="px-6 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link href={`/admin/series/${seriesId}`} className="text-xs font-medium" style={{ color: "var(--accent-gold)" }}>
          &larr; Back to {series.title}
        </Link>
        <h1 className="text-xl font-bold mt-1">Ep. {episode.episodeNumber}: {episode.title}</h1>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          {episode.duration} &middot; {scholar?.name ?? "Unknown"}
        </p>
      </motion.div>

      {/* Transcript input */}
      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
          1. Get Transcript
        </p>
        <TranscriptInput onTranscriptReady={handleGenerate} />
      </Card>

      {/* Generation progress */}
      {genStatus && genStatus.status !== "complete" && (
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            2. AI Generation
          </p>
          <GenerationProgress
            status={genStatus}
            onRetry={() => {
              clearGenerationStatus(episodeId);
            }}
          />
        </Card>
      )}

      {/* Companion editor */}
      {companion && (
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            3. Review & Edit Companion
          </p>
          <CompanionEditor
            companion={companion}
            onSave={(updated) => setCompanion(episodeId, updated)}
          />
        </Card>
      )}
    </div>
  );
}
