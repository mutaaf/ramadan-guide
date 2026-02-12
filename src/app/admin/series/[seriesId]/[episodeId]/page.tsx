"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminStore } from "@/lib/series/admin-store";
import { usePublish } from "@/lib/series/useAutoPublish";
import { TranscriptInput } from "@/components/series/admin/TranscriptInput";
import { GenerationProgress } from "@/components/series/admin/GenerationProgress";
import { CompanionEditor } from "@/components/series/admin/CompanionEditor";

export default function AdminEpisodeEditorPage({
  params,
}: {
  params: Promise<{ seriesId: string; episodeId: string }>;
}) {
  const { seriesId, episodeId } = use(params);
  const router = useRouter();
  const {
    series: allSeries,
    scholars,
    episodes,
    companions,
    transcripts,
    generationStatuses,
    setCompanion,
    setTranscript,
    setGenerationStatus,
    clearGenerationStatus,
    removeEpisode,
  } = useAdminStore();

  const series = allSeries.find((s) => s.id === seriesId);
  const seriesEpisodes = episodes[seriesId] ?? [];
  const episode = seriesEpisodes.find((e) => e.id === episodeId);
  const companion = companions[episodeId] ?? null;
  const genStatus = generationStatuses[episodeId] ?? null;
  const scholar = series ? scholars.find((s) => s.id === series.scholarId) : null;
  const savedTranscript = transcripts[episodeId] ?? null;

  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [regenSection, setRegenSection] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { status: publishStatus, hasUnpublishedChanges, publishNow } = usePublish();

  if (!series || !episode) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Episode not found</p>
      </div>
    );
  }

  const handleGenerate = async (transcript: string) => {
    // Save transcript for later re-generation
    setTranscript(episodeId, transcript);

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

  const handleRegenSection = async (section: string) => {
    if (!savedTranscript || !companion) return;
    setRegenSection(section);
    try {
      const res = await fetch("/api/series/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          transcript: savedTranscript,
          scholarName: scholar?.name ?? "Unknown Scholar",
          seriesTitle: series.title,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.title,
          existingCompanion: companion,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Regeneration failed");
      }

      const { sectionData } = await res.json();
      // The API returns { [section]: data }, merge into companion
      const updated = { ...companion, ...sectionData };
      setCompanion(episodeId, updated);
    } catch (err) {
      console.error("Section regen failed:", err);
    } finally {
      setRegenSection(null);
    }
  };

  const seriesContext = {
    scholarName: scholar?.name ?? "Unknown Scholar",
    seriesTitle: series.title,
    episodeNumber: episode.episodeNumber,
    episodeTitle: episode.title,
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

      {/* Publish status */}
      {publishStatus !== "idle" && (
        <div
          className="rounded-xl px-3 py-2 text-xs font-medium text-center"
          style={{
            background:
              publishStatus === "publishing" ? "rgba(212, 168, 83, 0.1)"
                : publishStatus === "published" ? "rgba(45, 212, 191, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
            color:
              publishStatus === "publishing" ? "var(--accent-gold)"
                : publishStatus === "published" ? "var(--accent-teal, #2dd4bf)"
                  : "#ef4444",
          }}
        >
          {publishStatus === "publishing" ? "Publishing changes..." : publishStatus === "published" ? "Published!" : "Publish failed"}
        </div>
      )}
      {hasUnpublishedChanges && publishStatus === "idle" && (
        <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
          <span className="text-xs font-medium" style={{ color: "#f59e0b" }}>Unpublished changes</span>
          <button
            onClick={publishNow}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(212, 168, 83, 0.15)", color: "var(--accent-gold)" }}
          >
            Publish Now
          </button>
        </div>
      )}

      {/* Transcript input */}
      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
          1. Get Transcript
        </p>
        <TranscriptInput onTranscriptReady={handleGenerate} />
      </Card>

      {/* Saved transcript preview */}
      {savedTranscript && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
              Saved Transcript
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="text-[10px] font-medium px-2 py-0.5 rounded"
                style={{ background: "var(--surface-1)", color: "var(--muted)" }}
              >
                {showFullTranscript ? "Collapse" : "Show Full"}
              </button>
              <button
                onClick={() => handleGenerate(savedTranscript)}
                className="text-[10px] font-medium px-2 py-0.5 rounded"
                style={{ background: "rgba(45, 212, 191, 0.12)", color: "var(--accent-teal, #2dd4bf)" }}
              >
                Re-generate
              </button>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {showFullTranscript ? savedTranscript : savedTranscript.slice(0, 500) + (savedTranscript.length > 500 ? "..." : "")}
          </p>
        </Card>
      )}

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
            episodeId={episodeId}
            seriesContext={seriesContext}
            onSave={(updated) => setCompanion(episodeId, updated)}
            onRegenSection={savedTranscript ? handleRegenSection : undefined}
          />
          {regenSection && (
            <p className="text-[11px] mt-2" style={{ color: "var(--accent-teal, #2dd4bf)" }}>
              Regenerating {regenSection}...
            </p>
          )}
        </Card>
      )}

      {/* Delete episode */}
      <div className="pt-4">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-xs font-medium px-4 py-2 rounded-xl"
          style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
        >
          Delete Episode
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Episode"
        message={`Are you sure you want to delete "${episode.title}"? This will also remove its companion guide and transcript.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          removeEpisode(seriesId, episodeId);
          router.push(`/admin/series/${seriesId}`);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
