"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAI, useAIReady } from "@/lib/ai/hooks";
import { MealPlanInput, MealPlanOutput } from "@/lib/ai/types";
import { buildMealPlanPrompts } from "@/lib/ai/prompts/meal-plan";

interface MealRecommendationProps {
  input: MealPlanInput | null;
}

function MealSection({ title, foods, reasoning, color }: { title: string; foods: string[]; reasoning: string; color: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--surface-1)" }}>
      <p className="text-xs font-medium mb-2" style={{ color }}>{title}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {foods.map((food) => (
          <span
            key={food}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            {food}
          </span>
        ))}
      </div>
      <p className="text-[11px] leading-snug" style={{ color: "var(--muted)" }}>{reasoning}</p>
    </div>
  );
}

export function MealRecommendation({ input }: MealRecommendationProps) {
  const ready = useAIReady();
  const buildPrompts = useCallback(
    (i: MealPlanInput) => buildMealPlanPrompts(i),
    []
  );
  const { data, loading, error, cached, generate } = useAI<
    MealPlanInput,
    MealPlanOutput
  >("meal-plan", input, buildPrompts);

  if (!ready) return null;

  return (
    <Card delay={0.55} className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          AI Meal Plan
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
          Get Personalized Meal Plan
        </button>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 rounded-lg shimmer" style={{ width: `${90 - i * 12}%` }} />
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
          <MealSection title="Sahoor" foods={data.sahoor.foods} reasoning={data.sahoor.reasoning} color="var(--accent-green)" />
          <MealSection title="Iftar" foods={data.iftar.foods} reasoning={data.iftar.reasoning} color="var(--accent-teal)" />
          <MealSection title="Post-Taraweeh" foods={data.postTaraweeh.foods} reasoning={data.postTaraweeh.reasoning} color="var(--accent-gold)" />

          <div className="rounded-xl p-3" style={{ background: "rgba(20, 123, 123, 0.06)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-teal)" }}>
              Hydration Plan
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {data.hydrationPlan}
            </p>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
