"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { AICache } from "@/lib/ai/cache";

interface AISettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AISettingsModal({ open, onClose }: AISettingsModalProps) {
  const { apiKey, setApiKey, aiModelPreference, setAiModelPreference, useApiRoute, setUseApiRoute } = useStore();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [cacheStats, setCacheStats] = useState(AICache.getStats());

  const handleSave = () => {
    setApiKey(keyInput.trim());
    onClose();
  };

  const handleClearCache = () => {
    AICache.clear();
    setCacheStats(AICache.getStats());
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 top-auto z-[61] max-h-[80vh] overflow-y-auto rounded-3xl p-6"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">AI Settings</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--surface-1)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* API Route Toggle */}
            <div className="mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Use Server Route</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {useApiRoute ? "Using built-in server key (recommended)" : "Proxy through /api/ai"}
                  </p>
                </div>
                <button
                  onClick={() => setUseApiRoute(!useApiRoute)}
                  className="relative h-7 w-12 rounded-full transition-colors"
                  style={{ background: useApiRoute ? "var(--accent-gold)" : "var(--ring-track)" }}
                >
                  <div
                    className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all shadow-sm"
                    style={{ left: useApiRoute ? 22 : 2 }}
                  />
                </button>
              </div>
            </div>

            {/* API Key */}
            <div className="mb-5" style={{ opacity: useApiRoute ? 0.4 : 1, pointerEvents: useApiRoute ? "none" : "auto" }}>
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: "var(--accent-gold)" }}>
                OpenAI API Key
              </label>
              <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                {useApiRoute ? "Not needed — server key is active." : "Your key stays in your browser — never sent to our servers."}
              </p>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-16"
                  style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Model Preference */}
            <div className="mb-5">
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: "var(--accent-gold)" }}>
                Model Preference
              </label>
              <div className="flex gap-2">
                {["", "gpt-4o-mini", "gpt-4o"].map((model) => (
                  <button
                    key={model}
                    onClick={() => setAiModelPreference(model)}
                    className="flex-1 rounded-xl py-2.5 text-xs font-medium transition-all"
                    style={{
                      background: aiModelPreference === model ? "var(--selected-gold-bg)" : "var(--surface-1)",
                      color: aiModelPreference === model ? "var(--accent-gold)" : "var(--muted)",
                      border: aiModelPreference === model ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
                    }}
                  >
                    {model || "Auto"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cache Stats */}
            <div className="mb-6">
              <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: "var(--accent-gold)" }}>
                Cache
              </label>
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--surface-1)" }}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--muted)" }}>Entries</span>
                  <span className="font-medium">{cacheStats.totalEntries}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--muted)" }}>Size</span>
                  <span className="font-medium">{formatBytes(cacheStats.totalSizeBytes)}</span>
                </div>
                {Object.entries(cacheStats.hitsByFeature).map(([feature, count]) => (
                  <div key={feature} className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--muted)" }}>{feature}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleClearCache}
                className="mt-2 w-full rounded-xl py-2.5 text-xs font-medium"
                style={{ background: "var(--surface-1)", color: "var(--muted)" }}
              >
                Clear Cache
              </button>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="w-full rounded-2xl py-3.5 text-sm font-semibold text-black"
              style={{ background: "var(--accent-gold)" }}
            >
              Save Settings
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
