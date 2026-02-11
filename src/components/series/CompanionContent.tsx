"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CompanionGuide } from "@/lib/series/types";
import { HadithCard } from "./HadithCard";
import { VerseCard } from "./VerseCard";
import { ActionItemList } from "./ActionItemList";

interface CompanionContentProps {
  companion: CompanionGuide;
}

type Tab = "overview" | "hadiths" | "verses" | "actions";

export function CompanionContent({ companion }: CompanionContentProps) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "hadiths", label: "Hadiths", count: companion.hadiths.length },
    { key: "verses", label: "Verses", count: companion.verses.length },
    { key: "actions", label: "Actions", count: companion.actionItems.length },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
            style={{
              background: tab === t.key ? "var(--accent-gold)" : "var(--surface-1)",
              color: tab === t.key ? "white" : "var(--muted)",
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1 opacity-75">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <motion.div
          key="overview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--accent-gold)" }}
            >
              Summary
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
              {companion.summary}
            </p>
          </div>

          {/* Key Quotes */}
          {companion.keyQuotes.length > 0 && (
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--accent-gold)" }}
              >
                Key Quotes
              </p>
              <div className="space-y-2">
                {companion.keyQuotes.map((quote, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 border-l-2"
                    style={{ background: "var(--surface-1)", borderLeftColor: "var(--accent-gold)" }}
                  >
                    <p className="text-[13px] leading-relaxed italic">&ldquo;{quote.text}&rdquo;</p>
                    {quote.timestamp && (
                      <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                        {quote.timestamp}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {companion.themes.length > 0 && (
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--accent-gold)" }}
              >
                Themes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {companion.themes.map((theme) => (
                  <span
                    key={theme}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-1)", color: "var(--muted)" }}
                  >
                    {theme.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {companion.nextSteps.length > 0 && (
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--accent-gold)" }}
              >
                Next Steps
              </p>
              <div className="space-y-1.5">
                {companion.nextSteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[13px]"
                    style={{ color: "var(--muted)" }}
                  >
                    <span style={{ color: "var(--accent-gold)" }}>{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {tab === "hadiths" && (
        <motion.div key="hadiths" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {companion.hadiths.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>No hadiths extracted</p>
          ) : (
            companion.hadiths.map((h, i) => <HadithCard key={i} hadith={h} index={i} />)
          )}
        </motion.div>
      )}

      {tab === "verses" && (
        <motion.div key="verses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {companion.verses.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>No verses extracted</p>
          ) : (
            companion.verses.map((v, i) => <VerseCard key={i} verse={v} index={i} />)
          )}
        </motion.div>
      )}

      {tab === "actions" && (
        <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {companion.actionItems.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>No action items</p>
          ) : (
            <ActionItemList items={companion.actionItems} />
          )}
        </motion.div>
      )}
    </div>
  );
}
