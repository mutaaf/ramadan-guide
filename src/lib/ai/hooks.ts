"use client";

import { useState, useCallback, useEffect } from "react";
import { AIFeature } from "./types";
import { executeAIRequest } from "./client";
import { AICache } from "./cache";
import { useStore } from "@/store/useStore";

export function useAIReady(): boolean {
  const apiKey = useStore((s) => s.apiKey);
  return apiKey.length > 0;
}

interface UseAIResult<TOutput> {
  data: TOutput | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
  generate: () => void;
  reset: () => void;
}

export function useAI<TInput, TOutput>(
  feature: AIFeature,
  input: TInput | null,
  buildPrompts: (input: TInput) => { systemPrompt: string; userPrompt: string }
): UseAIResult<TOutput> {
  const apiKey = useStore((s) => s.apiKey);
  const aiModelPreference = useStore((s) => s.aiModelPreference);
  const useApiRoute = useStore((s) => s.useApiRoute);

  const [data, setData] = useState<TOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const generate = useCallback(async () => {
    if (!input) return;
    if (!apiKey && !useApiRoute) {
      setError("Please add your OpenAI API key in Settings");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { systemPrompt, userPrompt } = buildPrompts(input);
      const result = await executeAIRequest<TOutput>(
        feature,
        input,
        systemPrompt,
        userPrompt,
        {
          apiKey,
          useApiRoute,
          modelOverride: aiModelPreference || undefined,
        }
      );
      setData(result.data);
      setCached(result.cached);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [input, apiKey, useApiRoute, aiModelPreference, feature, buildPrompts]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setCached(false);
  }, []);

  return { data, loading, error, cached, generate, reset };
}

/** Run cache cleanup on app load */
export function useAICacheCleanup() {
  useEffect(() => {
    AICache.cleanup();
  }, []);
}
