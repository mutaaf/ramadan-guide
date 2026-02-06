"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ProgressRing } from "@/components/ProgressRing";
import { useStore } from "@/store/useStore";
import { getTodayString } from "@/lib/ramadan";

export default function TrackerPage() {
  const { getDay } = useStore();
  const today = getTodayString();
  const day = getDay(today);
  const prayerCount = Object.values(day.prayers).filter(Boolean).length;
  const prayerProgress = prayerCount / 6;
  const hydrationProgress = day.glassesOfWater / 8;

  const sections = [
    { href: "/tracker/journal", title: "Daily Journal", subtitle: "Log your day", icon: "J", accent: "var(--accent-gold)" },
    { href: "/tracker/hydration", title: "Hydration", subtitle: `${day.glassesOfWater}/8 glasses`, icon: "H", accent: "var(--accent-blue)" },
    { href: "/tracker/nutrition", title: "Nutrition", subtitle: "Meal planner", icon: "N", accent: "var(--accent-green)" },
    { href: "/tracker/schedule", title: "Daily Schedule", subtitle: "NFL Ramadan routine", icon: "S", accent: "var(--accent-teal)" },
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
            label={`${prayerCount}/6`}
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

        <div className="space-y-3">
          {sections.map((s, i) => (
            <Link key={s.href} href={s.href}>
              <Card delay={i * 0.06} className="flex items-center gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold shrink-0"
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
