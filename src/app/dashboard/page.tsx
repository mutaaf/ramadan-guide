"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ProgressRing } from "@/components/ProgressRing";
import { useStore, DayEntry } from "@/store/useStore";
import { CHECKLIST_ITEMS, CHALLENGES, getRamadanCountdown, getTodayString } from "@/lib/ramadan";
import { CoachInsight } from "@/components/ai/CoachInsight";
import { ProactiveInsight } from "@/components/ai/ProactiveInsight";
import { WeeklySummary } from "@/components/ai/WeeklySummary";
import { DailyCoachingInput, WeeklyAnalysisInput } from "@/lib/ai/types";

function CalendarHeatmap({ days }: { days: Record<string, DayEntry> }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cellSize = 28;
    const gap = 4;
    const cols = 6;
    const rows = 5;
    const w = cols * (cellSize + gap);
    const h = rows * (cellSize + gap) + 20;

    svg.attr("viewBox", `0 0 ${w} ${h}`);

    for (let i = 0; i < 30; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (cellSize + gap);
      const y = row * (cellSize + gap);

      // Calculate completion for this day
      const dayEntries = Object.values(days);
      const entry = dayEntries[i];
      let score = 0;
      if (entry) {
        const prayers = Object.values(entry.prayers).filter(Boolean).length;
        score += prayers / 6 * 0.4;
        score += (entry.glassesOfWater / 8) * 0.3;
        score += entry.fasted ? 0.2 : 0;
        score += entry.surahRead ? 0.1 : 0;
      }

      const color = score > 0
        ? d3.interpolateRgb("rgba(201, 168, 76, 0.15)", "rgba(201, 168, 76, 0.9)")(score)
        : "var(--surface-1)";

      svg
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("rx", 6)
        .attr("fill", color)
        .attr("opacity", 0)
        .transition()
        .delay(i * 20)
        .duration(300)
        .attr("opacity", 1);

      svg
        .append("text")
        .attr("x", x + cellSize / 2)
        .attr("y", y + cellSize / 2 + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", score > 0.5 ? "#000" : "var(--muted)")
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .text(i + 1);
    }
  }, [days]);

  return <svg ref={svgRef} className="w-full max-w-[220px] mx-auto" />;
}

export default function DashboardPage() {
  const { days, juzProgress, checklist, challengesCompleted, userName, sport } = useStore();

  const dayEntries = Object.values(days);
  const totalDays = dayEntries.length;
  const fastedDays = dayEntries.filter((d) => d.fasted).length;
  const juzDone = juzProgress.filter((p) => p === 100).length;
  const checklistDone = CHECKLIST_ITEMS.filter((c) => checklist[c.key]).length;
  const challengesDone = CHALLENGES.filter((c) => challengesCompleted[c.key]).length;

  // Prayer streak
  let streak = 0;
  const sortedDays = [...dayEntries].sort((a, b) => b.date.localeCompare(a.date));
  for (const d of sortedDays) {
    const all5 = d.prayers.fajr && d.prayers.dhur && d.prayers.asr && d.prayers.maghrib && d.prayers.ishaa;
    if (all5) streak++;
    else break;
  }

  // Average hydration
  const avgHydration = totalDays > 0
    ? dayEntries.reduce((sum, d) => sum + d.glassesOfWater, 0) / totalDays
    : 0;

  // AI coaching input
  const { dayOfRamadan } = getRamadanCountdown();
  const today = getTodayString();
  const todayEntry = days[today];

  const coachingInput = useMemo((): DailyCoachingInput | null => {
    if (!todayEntry) return null;
    const sorted = [...dayEntries].sort((a, b) => b.date.localeCompare(a.date));
    const recentDays = sorted.filter((d) => d.date !== today).slice(0, 3);
    return {
      today: todayEntry,
      recentDays,
      userName,
      sport,
      dayOfRamadan,
    };
  }, [todayEntry, dayEntries, today, userName, sport, dayOfRamadan]);

  // Weekly analysis input (available after 7+ days)
  const weeklyInput = useMemo((): WeeklyAnalysisInput | null => {
    if (totalDays < 7) return null;
    const sorted = [...dayEntries].sort((a, b) => b.date.localeCompare(a.date));
    const weekDays = sorted.slice(0, 7);
    const weekNumber = Math.ceil(totalDays / 7);
    return { days: weekDays, userName, sport, weekNumber };
  }, [dayEntries, totalDays, userName, sport]);

  return (
    <div>
      <PageHeader title="Progress" subtitle="Your Ramadan journey at a glance" />

      <div className="px-6 pb-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card delay={0.05}>
            <p className="text-2xl font-bold">{fastedDays}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Days Fasted</p>
          </Card>
          <Card delay={0.1}>
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Prayer Streak</p>
          </Card>
          <Card delay={0.15}>
            <p className="text-2xl font-bold">{avgHydration.toFixed(1)}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Avg Glasses/Day</p>
          </Card>
          <Card delay={0.2}>
            <p className="text-2xl font-bold">{totalDays}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Days Logged</p>
          </Card>
        </div>

        {/* Progress Rings */}
        <Card delay={0.25} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--accent-gold)" }}>
            Overall Progress
          </p>
          <div className="flex items-center justify-around">
            <ProgressRing
              progress={juzDone / 30}
              size={80}
              strokeWidth={6}
              color="var(--accent-gold)"
              label={`${juzDone}`}
              sublabel="Juz"
            />
            <ProgressRing
              progress={checklistDone / CHECKLIST_ITEMS.length}
              size={80}
              strokeWidth={6}
              color="var(--accent-green)"
              label={`${checklistDone}`}
              sublabel="Prep"
            />
            <ProgressRing
              progress={challengesDone / CHALLENGES.length}
              size={80}
              strokeWidth={6}
              color="var(--accent-teal)"
              label={`${challengesDone}`}
              sublabel="Challenges"
            />
          </div>
        </Card>

        {/* Calendar Heatmap */}
        <Card delay={0.3} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "var(--accent-gold)" }}>
            30-Day Overview
          </p>
          <CalendarHeatmap days={days} />
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>Less</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <div
                key={v}
                className="h-3 w-3 rounded-sm"
                style={{ background: d3.interpolateRgb("rgba(201, 168, 76, 0.15)", "rgba(201, 168, 76, 0.9)")(v) }}
              />
            ))}
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>More</span>
          </div>
        </Card>

        {/* Proactive AI Insight */}
        <ProactiveInsight />

        {/* AI Coach Insight */}
        <CoachInsight input={coachingInput} />

        {/* AI Weekly Analysis */}
        <WeeklySummary input={weeklyInput} />

        {/* Motivational */}
        <Card delay={0.35}>
          <p className="text-sm leading-relaxed italic text-center" style={{ color: "var(--muted)" }}>
            &ldquo;Allah&apos;s promise is true. Allah&apos;s plan is perfect. Allah is always right on time.&rdquo;
          </p>
          <p className="text-xs mt-2 text-center font-medium" style={{ color: "var(--accent-gold)" }}>
            — Coach Hamza
          </p>
        </Card>
      </div>
    </div>
  );
}
