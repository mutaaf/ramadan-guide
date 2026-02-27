"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/store/useStore";
import { evaluateBadges } from "@/lib/badges/evaluate";
import { BADGE_DEFINITIONS, type BadgeCategory, type BadgeDefinition } from "@/lib/badges/definitions";
import { BadgeCardList } from "@/components/badges/BadgeCard";
import { BadgeShareModal } from "@/components/badges/BadgeShareModal";

const CATEGORY_LABELS: { key: "all" | BadgeCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "journey", label: "Journey" },
  { key: "prayer", label: "Prayer" },
  { key: "quran", label: "Quran" },
  { key: "fasting", label: "Fasting" },
  { key: "wellness", label: "Wellness" },
];

export default function BadgesPage() {
  // Subscribe to key state for reactivity
  const days = useStore((s) => s.days);
  const juzProgress = useStore((s) => s.juzProgress);
  const onboarded = useStore((s) => s.onboarded);
  const seriesUserData = useStore((s) => s.seriesUserData);
  const tasbeehHistory = useStore((s) => s.tasbeehHistory);
  const markBadgesSeen = useStore((s) => s.markBadgesSeen);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | BadgeCategory>("all");

  // Re-evaluate on state changes
  void days; void juzProgress; void onboarded; void seriesUserData; void tasbeehHistory;
  const unlocked = evaluateBadges(useStore.getState());
  const unlockedIds = new Set(unlocked.map((b) => b.definition.id));
  const newIds = unlocked.filter((b) => b.isNew).map((b) => b.definition.id);

  // Mark badges as seen on mount
  useEffect(() => {
    if (newIds.length > 0) {
      markBadgesSeen(newIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBadges = activeCategory === "all"
    ? BADGE_DEFINITIONS
    : BADGE_DEFINITIONS.filter((b) => b.category === activeCategory);

  const unlockedCount = unlocked.length;
  const totalCount = BADGE_DEFINITIONS.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div>
      <PageHeader title="Achievements" subtitle="Share your Ramadan milestones" back="/dashboard" />

      <div className="px-6 pb-8">
        {/* Summary */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
        >
          {/* Mini progress ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="#c9a84c"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progressPct * 0.975} 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{unlockedCount}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">{unlockedCount} of {totalCount} unlocked</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {unlockedCount === 0
                ? "Start tracking to earn badges"
                : unlockedCount === totalCount
                  ? "All badges unlocked! MashaAllah!"
                  : "Keep going to unlock more"}
            </p>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {CATEGORY_LABELS.map(({ key, label }) => {
            const isActive = activeCategory === key;
            const categoryCount = key === "all"
              ? BADGE_DEFINITIONS.length
              : BADGE_DEFINITIONS.filter((b) => b.category === key).length;
            const categoryUnlocked = key === "all"
              ? unlockedCount
              : BADGE_DEFINITIONS.filter((b) => b.category === key && unlockedIds.has(b.id)).length;

            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: isActive ? "var(--accent-gold)" : "var(--surface-1)",
                  color: isActive ? "#000" : "var(--muted)",
                  border: isActive ? "none" : "1px solid var(--card-border)",
                }}
              >
                {label} {categoryUnlocked}/{categoryCount}
              </button>
            );
          })}
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredBadges.map((badge, i) => {
            const isUnlocked = unlockedIds.has(badge.id);
            const isNew = newIds.includes(badge.id);
            return (
              <BadgeCardList
                key={badge.id}
                badge={badge}
                unlocked={isUnlocked}
                isNew={isNew}
                index={i}
                onTap={() => setSelectedBadge(badge)}
              />
            );
          })}
        </div>
      </div>

      {/* Share modal */}
      <BadgeShareModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </div>
  );
}
