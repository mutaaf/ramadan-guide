"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AIFeature } from "./types";
import { executeAIRequest } from "./client";
import { AICache } from "./cache";
import { streamAIRequest } from "./stream";
import { useStore } from "@/store/useStore";

export function useAIReady(): boolean {
  const apiKey = useStore((s) => s.apiKey);
  const useApiRoute = useStore((s) => s.useApiRoute);
  return useApiRoute || apiKey.length > 0;
}

interface UseAIOptions {
  autoTrigger?: boolean;
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
  buildPrompts: (input: TInput) => { systemPrompt: string; userPrompt: string },
  options?: UseAIOptions
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
      setError("Please enable the server route or add your OpenAI API key in Settings");
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

  // Auto-trigger on input change
  const prevInputRef = useRef<string | null>(null);
  useEffect(() => {
    if (!options?.autoTrigger || !input) return;
    const inputKey = JSON.stringify(input);
    if (inputKey !== prevInputRef.current) {
      prevInputRef.current = inputKey;
      generate();
    }
  }, [options?.autoTrigger, input, generate]);

  return { data, loading, error, cached, generate, reset };
}

interface UseAIStreamResult {
  text: string;
  loading: boolean;
  error: string | null;
  generate: (systemPrompt: string, userPrompt: string) => void;
  reset: () => void;
}

export function useAIStream(): UseAIStreamResult {
  const apiKey = useStore((s) => s.apiKey);
  const aiModelPreference = useStore((s) => s.aiModelPreference);
  const useApiRoute = useStore((s) => s.useApiRoute);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    (systemPrompt: string, userPrompt: string) => {
      if (!apiKey && !useApiRoute) {
        setError("Please enable the server route or add your OpenAI API key in Settings");
        return;
      }

      // Abort previous
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setText("");

      const model = aiModelPreference || "gpt-4o-mini";

      streamAIRequest(
        systemPrompt,
        userPrompt,
        model,
        (fullText) => setText(fullText),
        {
          useApiRoute,
          apiKey,
          signal: controller.signal,
        }
      )
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setError(err instanceof Error ? err.message : "Something went wrong");
        })
        .finally(() => setLoading(false));
    },
    [apiKey, aiModelPreference, useApiRoute]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setText("");
    setError(null);
    setLoading(false);
  }, []);

  return { text, loading, error, generate, reset };
}

/** Run cache cleanup on app load */
export function useAICacheCleanup() {
  useEffect(() => {
    AICache.cleanup();
  }, []);
}
