"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NFL_SCHEDULE, SCHEDULE_CATEGORY_COLORS } from "@/lib/ramadan";
import { useStore } from "@/store/useStore";

interface ScheduleItem {
  time: string;
  activity: string;
  category: string;
}

function RadialClock({ schedule }: { schedule: ScheduleItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = 320;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 140;
    const innerR = 80;

    svg.attr("viewBox", `0 0 ${size} ${size}`);

    // Parse time to minutes from midnight
    function parseTime(t: string): number {
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)/);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2]);
      const ampm = match[3];
      if (ampm === "PM" && hours !== 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      return hours * 60 + mins;
    }

    // 24-hour markers
    for (let h = 0; h < 24; h++) {
      const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
      const labelR = outerR + 14;

      if (h % 3 === 0) {
        svg
          .append("text")
          .attr("x", cx + labelR * Math.cos(angle))
          .attr("y", cy + labelR * Math.sin(angle))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "var(--muted)")
          .attr("font-size", "9px")
          .attr("font-weight", "500")
          .text(`${h}:00`);
      }

      // Tick marks
      const tickStart = outerR - 4;
      const tickEnd = outerR;
      svg
        .append("line")
        .attr("x1", cx + tickStart * Math.cos(angle))
        .attr("y1", cy + tickStart * Math.sin(angle))
        .attr("x2", cx + tickEnd * Math.cos(angle))
        .attr("y2", cy + tickEnd * Math.sin(angle))
        .attr("stroke", "var(--card-border)")
        .attr("stroke-width", h % 3 === 0 ? 2 : 1);
    }

    // Background ring
    svg
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", outerR)
      .attr("fill", "none")
      .attr("stroke", "var(--card-border)")
      .attr("stroke-width", 1);

    svg
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", innerR)
      .attr("fill", "none")
      .attr("stroke", "var(--card-border)")
      .attr("stroke-width", 1);

    // Activity arcs
    const arc = d3
      .arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(innerR + 2)
      .outerRadius(outerR - 2)
      .cornerRadius(3);

    schedule.forEach((item, i) => {
      const startMin = parseTime(item.time);
      const next = schedule[i + 1];
      const endMin = next ? parseTime(next.time) : startMin + 30;

      const startAngle = (startMin / (24 * 60)) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endMin / (24 * 60)) * 2 * Math.PI - Math.PI / 2;

      svg
        .append("path")
        .datum({ startAngle, endAngle })
        .attr("transform", `translate(${cx}, ${cy})`)
        .attr("d", (d) => arc(d))
        .attr("fill", SCHEDULE_CATEGORY_COLORS[item.category] || "#666")
        .attr("opacity", 0)
        .transition()
        .delay(i * 30)
        .duration(400)
        .attr("opacity", 0.7);
    });

    // Center label
    svg
      .append("text")
      .attr("x", cx)
      .attr("y", cy - 6)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .text("24 Hours");

    svg
      .append("text")
      .attr("x", cx)
      .attr("y", cy + 10)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--muted)")
      .attr("font-size", "9px")
      .text("Ramadan Day");
  }, [schedule]);

  return (
    <div
      role="img"
      aria-label="24-hour radial clock showing a typical Ramadan day during NFL training camp, with activities color-coded by category: sleep, meals, prayers, training, and rest periods."
    >
      <svg ref={svgRef} className="w-full max-w-sm mx-auto" aria-hidden="true" />
    </div>
  );
}

function formatTime12h(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default function SchedulePage() {
  const { customSchedule, clearCustomSchedule } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (customSchedule) {
      setShowCustom(true);
    }
  }, [customSchedule]);

  if (!mounted) return null;

  // Convert custom schedule blocks to display format
  const customScheduleItems: ScheduleItem[] = customSchedule
    ? customSchedule.blocks.map((block) => ({
        time: formatTime12h(block.startTime),
        activity: block.activity,
        category: block.category,
      }))
    : [];

  const activeSchedule = showCustom && customSchedule ? customScheduleItems : NFL_SCHEDULE;
  const subtitle = showCustom && customSchedule
    ? "Your personalized Ramadan routine"
    : "A Day of Ramadan during NFL Training Camp";

  return (
    <div>
      <PageHeader title="Daily Schedule" subtitle={subtitle} back="/tracker" />

      <div className="px-6 pb-8">
        {/* Toggle between schedules */}
        {customSchedule && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowCustom(true)}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: showCustom ? "var(--selected-gold-bg)" : "var(--surface-1)",
                border: showCustom ? "1px solid var(--accent-gold)" : "1px solid transparent",
                color: showCustom ? "var(--accent-gold)" : "var(--muted)",
              }}
            >
              My Schedule
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: !showCustom ? "var(--selected-gold-bg)" : "var(--surface-1)",
                border: !showCustom ? "1px solid var(--accent-gold)" : "1px solid transparent",
                color: !showCustom ? "var(--accent-gold)" : "var(--muted)",
              }}
            >
              NFL Baseline
            </button>
          </div>
        )}

        <Card className="mb-6">
          <RadialClock schedule={activeSchedule} />
        </Card>

        {/* Coach's reasoning for custom schedule */}
        {showCustom && customSchedule?.reasoning && (
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: "var(--selected-gold-bg)", border: "1px solid var(--accent-gold)" }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-gold)" }}>
              Coach Hamza&apos;s Notes
            </p>
            <p className="text-sm" style={{ color: "var(--foreground)" }}>
              {customSchedule.reasoning}
            </p>
          </div>
        )}

        {/* Tips for custom schedule */}
        {showCustom && customSchedule?.tips && customSchedule.tips.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {customSchedule.tips.map((tip, i) => (
                <span
                  key={i}
                  className="rounded-full px-3 py-1 text-xs"
                  style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {Object.entries(SCHEDULE_CATEGORY_COLORS)
            .filter(([cat]) => activeSchedule.some((item) => item.category === cat))
            .map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ background: color, opacity: 0.7 }} />
                <span className="text-xs capitalize" style={{ color: "var(--muted)" }}>{cat}</span>
              </div>
            ))}
        </div>

        {/* Timeline */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Full Schedule
        </div>
        <div className="space-y-1">
          {activeSchedule.map((item, i) => (
            <Card key={i} delay={i * 0.02} className="flex items-center gap-3 !py-3">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: SCHEDULE_CATEGORY_COLORS[item.category], opacity: 0.8 }}
              />
              <span className="text-xs font-mono w-16 shrink-0" style={{ color: "var(--muted)" }}>
                {item.time}
              </span>
              <span className="text-sm font-medium">{item.activity}</span>
            </Card>
          ))}
        </div>

        {/* Create/Edit Schedule Button */}
        <div className="mt-6 space-y-3">
          <Link href="/tracker/schedule/customize">
            <button
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: customSchedule ? "var(--surface-1)" : "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                color: customSchedule ? "var(--accent-gold)" : "black",
                border: customSchedule ? "1px solid var(--card-border)" : "none",
              }}
            >
              {customSchedule ? "Edit My Schedule" : "Create Your Schedule"}
            </button>
          </Link>

          {customSchedule && (
            <button
              onClick={() => {
                clearCustomSchedule();
                setShowCustom(false);
              }}
              className="w-full rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.98]"
              style={{ color: "#ef4444" }}
            >
              Delete My Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
