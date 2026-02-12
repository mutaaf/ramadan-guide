"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ProgressRing } from "@/components/ProgressRing";
import { SavedActionsCard } from "@/components/series/SavedActionsCard";
import { useStore, createEmptyDay } from "@/store/useStore";
import { getTodayString } from "@/lib/ramadan";

export default function TrackerPage() {
  const { days, seriesUserData } = useStore();
  const today = getTodayString();
  const day = days[today] ?? createEmptyDay(today);
  // Count only the 5 obligatory daily prayers (not Taraweeh)
  const dailyPrayerCount = [day.prayers.fajr, day.prayers.dhur, day.prayers.asr, day.prayers.maghrib, day.prayers.ishaa].filter(Boolean).length;
  const prayerProgress = dailyPrayerCount / 5;
  const hydrationProgress = day.glassesOfWater / 8;

  const lastViewed = seriesUserData.lastViewed;

  const sections = [
    { href: "/tracker/journal", title: "Daily Journal", subtitle: "Log your day", icon: "J", accent: "var(--accent-gold)" },
    { href: "/tracker/hydration", title: "Hydration", subtitle: `${day.glassesOfWater}/8 glasses`, icon: "H", accent: "var(--accent-blue)" },
    { href: "/tracker/nutrition", title: "Nutrition", subtitle: "Meal planner", icon: "N", accent: "var(--accent-green)" },
    { href: "/tracker/schedule", title: "Daily Schedule", subtitle: "Your personalized routine", icon: "S", accent: "var(--accent-teal)" },
    { href: "/tracker/quran", title: "Qur'an Progress", subtitle: "Juz tracker", icon: "Q", accent: "var(--accent-gold)" },
    { href: "/tracker/tasbeeh", title: "Tasbeeh Counter", subtitle: "Dhikr tracker", icon: "T", accent: "var(--accent-gold)" },
  ];

  return (
    <div>
      <PageHeader title="Track" subtitle={`Today — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`} />

      <div className="px-6 pb-8">
        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <ProgressRing
            progress={prayerProgress}
            size={80}
            strokeWidth={6}
            color="var(--accent-gold)"
            label={`${dailyPrayerCount}/5`}
            sublabel="Prayers"
          />
          <ProgressRing
            progress={hydrationProgress}
            size={80}
            strokeWidth={6}
            color="var(--accent-blue)"
            label={`${day.glassesOfWater}/8`}
            sublabel="Glasses"
          />
        </div>

        {/* Saved Actions */}
        <div className="mb-4">
          <SavedActionsCard />
        </div>

        {/* Continue Learning */}
        {lastViewed && (
          <Link href={`/learn/series/${lastViewed.seriesId}/${lastViewed.episodeId}`}>
            <Card asLink className="flex items-center gap-4 mb-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold shrink-0"
                style={{ background: "rgba(167, 139, 250, 0.12)", color: "#a78bfa" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px]">Continue Learning</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Pick up where you left off</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Card>
          </Link>
        )}

        <div className="space-y-2 lg:space-y-3">
          {sections.map((s, i) => (
            <Link key={s.href} href={s.href}>
              <Card asLink delay={i * 0.06} className="flex items-center gap-4 lg:gap-5">
                <div
                  className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl text-base font-bold shrink-0"
                  style={{ background: `${s.accent}15`, color: s.accent }}
                >
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px]">{s.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.subtitle}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
