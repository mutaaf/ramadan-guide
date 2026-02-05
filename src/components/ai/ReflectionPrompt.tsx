"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { ReflectionInput, ReflectionOutput } from "@/lib/ai/types";
import { buildReflectionPrompts } from "@/lib/ai/prompts/reflection";

interface ReflectionPromptProps {
  input: ReflectionInput | null;
}

export function ReflectionPrompt({ input }: ReflectionPromptProps) {
  const ready = useAIReady();
  const buildPrompts = useCallback(
    (i: ReflectionInput) => buildReflectionPrompts(i),
    []
  );
  const { data, loading, error, cached, generate } = useAI<
    ReflectionInput,
    ReflectionOutput
  >("reflection", input, buildPrompts);

  if (!ready) return null;

  return (
    <Card delay={0.5} className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Reflection &amp; Duaa
        </p>
        {cached && (
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
            cached
          </span>
        )}
      </div>

      {!data && !loading && !error && (
        <button
          onClick={generate}
          className="w-full rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.98]"
          style={{ background: "rgba(201, 168, 76, 0.1)", color: "var(--accent-gold)" }}
        >
          Get Personalized Duaa
        </button>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 rounded-lg shimmer" style={{ width: `${80 - i * 10}%` }} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-xs" style={{ color: "#e55" }}>
          <p>{error}</p>
          <button onClick={generate} className="mt-2 underline" style={{ color: "var(--accent-gold)" }}>
            Try again
          </button>
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* Duaa */}
          <div className="rounded-xl p-4 text-center" style={{ background: "rgba(201, 168, 76, 0.06)" }}>
            <p className="text-sm font-medium leading-relaxed italic" style={{ color: "var(--accent-gold)" }}>
              {data.duaaArabic}
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.duaa}
            </p>
          </div>

          {/* Reflection */}
          <div>
            <p className="text-xs font-medium mb-1">Reflection</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.reflection}
            </p>
          </div>

          {/* Connection */}
          <p className="text-xs italic leading-relaxed" style={{ color: "var(--muted)" }}>
            {data.connection}
          </p>
        </motion.div>
      )}
    </Card>
  );
}
