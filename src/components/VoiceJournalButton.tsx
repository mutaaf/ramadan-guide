"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "./VoiceRecorder";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { VoiceJournalInput, VoiceJournalOutput } from "@/lib/ai/types";
import { buildVoiceJournalPrompts } from "@/lib/ai/prompts/voice-journal";
import { useStore, DayEntry, createEmptyDay } from "@/store/useStore";

interface VoiceJournalButtonProps {
  date: string;
}

type Stage = "idle" | "recording" | "transcript" | "parsed" | "done";

export function VoiceJournalButton({ date }: VoiceJournalButtonProps) {
  const ready = useAIReady();
  const { updateDay, togglePrayer, days } = useStore();
  const [stage, setStage] = useState<Stage>("idle");
  const [transcriptText, setTranscriptText] = useState("");
  const [journalInput, setJournalInput] = useState<VoiceJournalInput | null>(
    null
  );

  const buildPrompts = useCallback(
    (i: VoiceJournalInput) => buildVoiceJournalPrompts(i),
    []
  );

  const { data: parsed, loading: parsing } = useAI<
    VoiceJournalInput,
    VoiceJournalOutput
  >("voice-journal", journalInput, buildPrompts, { autoTrigger: true });

  const recorder = VoiceRecorder({
    onTranscript: (text) => {
      setTranscriptText(text);
      setStage("transcript");
    },
  });

  const handleStartRecording = () => {
    setStage("recording");
    recorder.start();
  };

  const handleStopRecording = () => {
    recorder.stop();
  };

  const handleParseTranscript = () => {
    setJournalInput({ transcript: transcriptText });
    setStage("parsed");
  };

  const handleConfirm = () => {
    if (!parsed) return;
    const day = days[date] ?? createEmptyDay(date);

    // Build update data
    const update: Partial<DayEntry> = {};
    if (parsed.hoursOfSleep > 0) update.hoursOfSleep = parsed.hoursOfSleep;
    if (parsed.feelsRested) update.feelsRested = parsed.feelsRested;
    if (parsed.mood) update.mood = parsed.mood;
    if (parsed.trainingType)
      update.trainingType = parsed.trainingType as DayEntry["trainingType"];
    if (parsed.sahoorMeal) update.sahoorMeal = parsed.sahoorMeal;
    if (parsed.iftarMeal) update.iftarMeal = parsed.iftarMeal;
    if (parsed.surahRead) update.surahRead = parsed.surahRead;
    if (parsed.firstThought) update.firstThought = parsed.firstThought;
    if (parsed.tomorrowGoals) update.tomorrowGoals = parsed.tomorrowGoals;
    if (parsed.glassesOfWater > 0)
      update.glassesOfWater = parsed.glassesOfWater;

    if (Object.keys(update).length > 0) {
      updateDay(date, update);
    }

    // Toggle prayers that were detected as true but aren't already on
    if (parsed.prayers) {
      const prayerKeys = [
        "fajr",
        "dhur",
        "asr",
        "maghrib",
        "ishaa",
        "taraweeh",
      ] as const;
      for (const prayer of prayerKeys) {
        if (parsed.prayers[prayer] && !day.prayers[prayer]) {
          togglePrayer(date, prayer);
        }
      }
    }

    setStage("done");
    // Reset after brief delay
    setTimeout(() => {
      setStage("idle");
      setTranscriptText("");
      setJournalInput(null);
    }, 1500);
  };

  const handleCancel = () => {
    recorder.stop();
    setStage("idle");
    setTranscriptText("");
    setJournalInput(null);
  };

  if (!ready) return null;

  return (
    <>
      {/* Floating Mic Button */}
      <AnimatePresence>
        {stage === "idle" && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={handleStartRecording}
            className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
            style={{ background: "var(--accent-gold)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Recording / Transcript / Parsed overlay */}
      <AnimatePresence>
        {stage !== "idle" && stage !== "done" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
              }}
              onClick={handleCancel}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 z-[61] max-h-[80vh] overflow-y-auto rounded-3xl p-6"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Recording state */}
              {stage === "recording" && (
                <div className="text-center py-6">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-flex h-20 w-20 items-center justify-center rounded-full mb-4"
                    style={{ background: "rgba(239, 68, 68, 0.15)" }}
                  >
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ background: "#ef4444" }}
                    />
                  </motion.div>
                  <p className="text-sm font-medium mb-1">Recording...</p>
                  <p
                    className="text-xs mb-6"
                    style={{ color: "var(--muted)" }}
                  >
                    Tell Coach Hamza about your day
                  </p>
                  {recorder.transcript && (
                    <p
                      className="text-xs mb-4 italic px-4"
                      style={{ color: "var(--muted)" }}
                    >
                      {recorder.transcript}
                    </p>
                  )}
                  <button
                    onClick={handleStopRecording}
                    className="rounded-2xl px-8 py-3 text-sm font-semibold text-black"
                    style={{ background: "var(--accent-gold)" }}
                  >
                    Stop Recording
                  </button>
                </div>
              )}

              {/* Transcript preview */}
              {stage === "transcript" && (
                <div>
                  <p className="text-sm font-bold mb-2">Your Words</p>
                  <div
                    className="rounded-xl p-4 mb-4 text-sm leading-relaxed"
                    style={{ background: "var(--surface-1)" }}
                  >
                    {transcriptText}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-2xl py-3 text-sm font-medium"
                      style={{
                        background: "var(--surface-1)",
                        color: "var(--muted)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleParseTranscript}
                      className="flex-1 rounded-2xl py-3 text-sm font-semibold text-black"
                      style={{ background: "var(--accent-gold)" }}
                    >
                      Parse Journal
                    </button>
                  </div>
                </div>
              )}

              {/* Parsed preview */}
              {stage === "parsed" && (
                <div>
                  <p className="text-sm font-bold mb-2">Parsed Entry</p>
                  {parsing && (
                    <div className="space-y-2 py-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-4 rounded-lg shimmer"
                          style={{ width: `${90 - i * 15}%` }}
                        />
                      ))}
                    </div>
                  )}
                  {parsed && (
                    <div
                      className="rounded-xl p-4 mb-4 space-y-1.5"
                      style={{ background: "var(--surface-1)" }}
                    >
                      {parsed.mood && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>Mood:</span>{" "}
                          {parsed.mood}
                        </p>
                      )}
                      {parsed.hoursOfSleep > 0 && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>Sleep:</span>{" "}
                          {parsed.hoursOfSleep}h
                        </p>
                      )}
                      {parsed.prayers && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>
                            Prayers:
                          </span>{" "}
                          {Object.entries(parsed.prayers)
                            .filter(([, v]) => v)
                            .map(([k]) => k)
                            .join(", ") || "none detected"}
                        </p>
                      )}
                      {parsed.trainingType && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>
                            Training:
                          </span>{" "}
                          {parsed.trainingType}
                        </p>
                      )}
                      {parsed.sahoorMeal && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>
                            Sahoor:
                          </span>{" "}
                          {parsed.sahoorMeal}
                        </p>
                      )}
                      {parsed.iftarMeal && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>Iftar:</span>{" "}
                          {parsed.iftarMeal}
                        </p>
                      )}
                      {parsed.surahRead && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>
                            Surah:
                          </span>{" "}
                          {parsed.surahRead}
                        </p>
                      )}
                      {parsed.glassesOfWater > 0 && (
                        <p className="text-xs">
                          <span style={{ color: "var(--muted)" }}>Water:</span>{" "}
                          {parsed.glassesOfWater} glasses
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-2xl py-3 text-sm font-medium"
                      style={{
                        background: "var(--surface-1)",
                        color: "var(--muted)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!parsed}
                      className="flex-1 rounded-2xl py-3 text-sm font-semibold text-black disabled:opacity-40"
                      style={{ background: "var(--accent-gold)" }}
                    >
                      Fill Journal
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Done confirmation */}
      <AnimatePresence>
        {stage === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-6 right-6 z-40 rounded-2xl px-4 py-3 text-center text-sm font-medium"
            style={{
              background: "var(--accent-gold)",
              color: "#000",
            }}
          >
            Journal updated from voice entry
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
