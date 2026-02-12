"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CompanionGuide } from "@/lib/series/types";
import { HadithCard } from "./HadithCard";
import { VerseCard } from "./VerseCard";
import { ActionItemList } from "./ActionItemList";

interface CompanionContentProps {
  companion: CompanionGuide;
  seriesId?: string;
  episodeId?: string;
}

type Tab = "overview" | "hadiths" | "verses" | "actions" | "discussion" | "glossary" | "resources";

const resourceTypeLabels: Record<string, string> = {
  book: "Book",
  article: "Article",
  video: "Video",
  tafsir: "Tafsir",
  "hadith-collection": "Hadith Collection",
};

export function CompanionContent({ companion, seriesId, episodeId }: CompanionContentProps) {
  const [tab, setTab] = useState<Tab>("overview");

  const hasDiscussion = (companion.discussionQuestions?.length ?? 0) > 0;
  const hasGlossary = (companion.glossary?.length ?? 0) > 0;
  const hasResources = (companion.recommendedResources?.length ?? 0) > 0;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "hadiths", label: "Hadiths", count: companion.hadiths.length },
    { key: "verses", label: "Verses", count: companion.verses.length },
    { key: "actions", label: "Actions", count: companion.actionItems.length },
    ...(hasDiscussion ? [{ key: "discussion" as Tab, label: "Discussion", count: companion.discussionQuestions!.length }] : []),
    ...(hasGlossary ? [{ key: "glossary" as Tab, label: "Glossary", count: companion.glossary!.length }] : []),
    ...(hasResources ? [{ key: "resources" as Tab, label: "Resources", count: companion.recommendedResources!.length }] : []),
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
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
              Summary
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
              {companion.summary}
            </p>
          </div>

          {/* Key Quotes */}
          {companion.keyQuotes.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
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
                      <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>{quote.timestamp}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {companion.themes.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
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
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
                Next Steps
              </p>
              <div className="space-y-1.5">
                {companion.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--muted)" }}>
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
            <ActionItemList items={companion.actionItems} seriesId={seriesId} episodeId={episodeId} />
          )}
        </motion.div>
      )}

      {tab === "discussion" && hasDiscussion && (
        <motion.div key="discussion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Discussion Questions
          </p>
          {companion.discussionQuestions!.map((q, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
              <p className="text-[13px] font-medium">{i + 1}. {q.question}</p>
              {q.context && (
                <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{q.context}</p>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {tab === "glossary" && hasGlossary && (
        <motion.div key="glossary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Glossary
          </p>
          {companion.glossary!.map((g, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-baseline gap-2">
                <p className="text-[13px] font-semibold">{g.term}</p>
                {g.arabic && <p className="text-[12px]" style={{ color: "var(--accent-gold)" }}>{g.arabic}</p>}
              </div>
              <p className="text-[12px] mt-1">{g.definition}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>{g.context}</p>
            </div>
          ))}
        </motion.div>
      )}

      {tab === "resources" && hasResources && (
        <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Recommended Resources
          </p>
          {companion.recommendedResources!.map((r, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold">{r.title}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(96, 165, 250, 0.12)", color: "#60a5fa" }}>
                  {resourceTypeLabels[r.type] ?? r.type}
                </span>
              </div>
              {r.description && <p className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>{r.description}</p>}
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[11px] mt-1 inline-block" style={{ color: "var(--accent-gold)" }}>
                  View resource &rarr;
                </a>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
