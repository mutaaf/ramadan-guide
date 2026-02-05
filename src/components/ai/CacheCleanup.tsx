"use client";

import { useAICacheCleanup } from "@/lib/ai/hooks";

export function CacheCleanup() {
  useAICacheCleanup();
  return null;
}
