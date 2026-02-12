"use client";

import { useState } from "react";
import type { CompanionGuide } from "@/lib/series/types";
import { CompanionContent } from "../CompanionContent";
import { HadithEditor } from "./editors/HadithEditor";
import { VerseEditor } from "./editors/VerseEditor";
import { QuoteEditor } from "./editors/QuoteEditor";
import { ActionItemEditor } from "./editors/ActionItemEditor";
import { StringListEditor } from "./editors/StringListEditor";
import { DiscussionQuestionEditor } from "./editors/DiscussionQuestionEditor";
import { GlossaryEditor } from "./editors/GlossaryEditor";

interface CompanionEditorProps {
  companion: CompanionGuide;
  episodeId: string;
  seriesContext: {
    scholarName: string;
    seriesTitle: string;
    episodeNumber: number;
    episodeTitle: string;
  };
  onSave: (updated: CompanionGuide) => void;
  onRegenSection?: (section: string) => void;
}

type SectionKey = "summary" | "hadiths" | "verses" | "keyQuotes" | "actionItems" | "nextSteps" | "themes" | "discussionQuestions" | "glossary";

interface SectionDef {
  key: SectionKey;
  label: string;
  count: () => number;
}

export function CompanionEditor({ companion, onSave, onRegenSection }: CompanionEditorProps) {
  const [mode, setMode] = useState<"preview" | "edit" | "json">("preview");
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [draft, setDraft] = useState<CompanionGuide>(companion);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const sections: SectionDef[] = [
    { key: "summary", label: "Summary", count: () => (draft.summary ? 1 : 0) },
    { key: "hadiths", label: "Hadiths", count: () => draft.hadiths.length },
    { key: "verses", label: "Verses", count: () => draft.verses.length },
    { key: "keyQuotes", label: "Key Quotes", count: () => draft.keyQuotes.length },
    { key: "actionItems", label: "Action Items", count: () => draft.actionItems.length },
    { key: "nextSteps", label: "Next Steps", count: () => draft.nextSteps.length },
    { key: "themes", label: "Themes", count: () => draft.themes.length },
    { key: "discussionQuestions", label: "Discussion Questions", count: () => (draft.discussionQuestions ?? []).length },
    { key: "glossary", label: "Glossary", count: () => (draft.glossary ?? []).length },
  ];

  const toggleSection = (key: SectionKey) => {
    setOpenSection(openSection === key ? null : key);
  };

  const updateDraft = (partial: Partial<CompanionGuide>) => {
    setDraft((d) => ({ ...d, ...partial }));
  };

  const handleSave = () => {
    onSave(draft);
  };

  const renderSectionEditor = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <textarea
            value={draft.summary}
            onChange={(e) => updateDraft({ summary: e.target.value })}
            rows={4}
            className="w-full text-xs rounded-lg px-3 py-2 resize-none"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        );
      case "hadiths":
        return <HadithEditor items={draft.hadiths} onChange={(hadiths) => updateDraft({ hadiths })} />;
      case "verses":
        return <VerseEditor items={draft.verses} onChange={(verses) => updateDraft({ verses })} />;
      case "keyQuotes":
        return <QuoteEditor items={draft.keyQuotes} onChange={(keyQuotes) => updateDraft({ keyQuotes })} />;
      case "actionItems":
        return <ActionItemEditor items={draft.actionItems} onChange={(actionItems) => updateDraft({ actionItems })} />;
      case "nextSteps":
        return <StringListEditor items={draft.nextSteps} onChange={(nextSteps) => updateDraft({ nextSteps })} label="Step" placeholder="Next step suggestion..." />;
      case "themes":
        return <StringListEditor items={draft.themes} onChange={(themes) => updateDraft({ themes })} label="Theme" placeholder="theme-name (kebab-case)" />;
      case "discussionQuestions":
        return <DiscussionQuestionEditor items={draft.discussionQuestions ?? []} onChange={(discussionQuestions) => updateDraft({ discussionQuestions })} />;
      case "glossary":
        return <GlossaryEditor items={draft.glossary ?? []} onChange={(glossary) => updateDraft({ glossary })} />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        {(["preview", "edit", "json"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              if (m === "json") {
                setJsonText(JSON.stringify(draft, null, 2));
                setJsonError(null);
              }
            }}
            className="text-[12px] font-medium px-3 py-1.5 rounded-full capitalize"
            style={{
              background: mode === m ? "var(--accent-gold)" : "var(--surface-1)",
              color: mode === m ? "white" : "var(--muted)",
            }}
          >
            {m === "json" ? "Advanced" : m}
          </button>
        ))}
      </div>

      {mode === "preview" && (
        <CompanionContent companion={draft} />
      )}

      {mode === "edit" && (
        <div className="space-y-1">
          {sections.map(({ key, label, count }) => (
            <div key={key}>
              <div
                onClick={() => toggleSection(key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection(key); } }}
                role="button"
                tabIndex={0}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left cursor-pointer"
                style={{ background: openSection === key ? "var(--surface-1)" : "transparent" }}
              >
                <span className="text-xs font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  {onRegenSection && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRegenSection(key); }}
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{ background: "rgba(45, 212, 191, 0.12)", color: "var(--accent-teal, #2dd4bf)" }}
                    >
                      Re-gen
                    </button>
                  )}
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
                    {count()}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {openSection === key ? "▾" : "▸"}
                  </span>
                </div>
              </div>
              {openSection === key && (
                <div className="px-2 py-2">
                  {renderSectionEditor(key)}
                </div>
              )}
            </div>
          ))}

          <div className="pt-3">
            <button
              onClick={handleSave}
              className="text-xs font-medium px-4 py-2 rounded-xl"
              style={{ background: "var(--accent-gold)", color: "white" }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {mode === "json" && (
        <div className="space-y-2">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setJsonError(null);
            }}
            rows={16}
            className="w-full text-xs font-mono rounded-lg px-3 py-2 resize-y"
            style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
          {jsonError && <p className="text-[11px]" style={{ color: "#ef4444" }}>{jsonError}</p>}
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(jsonText) as CompanionGuide;
                setDraft(parsed);
                onSave(parsed);
                setJsonError(null);
              } catch {
                setJsonError("Invalid JSON");
              }
            }}
            className="text-xs font-medium px-4 py-2 rounded-xl"
            style={{ background: "var(--accent-gold)", color: "white" }}
          >
            Save JSON
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {draft.hadiths.length} hadiths
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {draft.verses.length} verses
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {draft.actionItems.length} actions
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
          {draft.keyQuotes.length} quotes
        </span>
        {(draft.discussionQuestions?.length ?? 0) > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
            {draft.discussionQuestions!.length} questions
          </span>
        )}
        {(draft.glossary?.length ?? 0) > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--muted)" }}>
            {draft.glossary!.length} terms
          </span>
        )}
      </div>
    </div>
  );
}
