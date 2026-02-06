"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { NFL_SCHEDULE } from "@/lib/ramadan";

const CATEGORY_COLORS: Record<string, string> = {
  sleep: "#6366f1",
  meal: "#c9a84c",
  prayer: "#2d6a4f",
  quran: "#c9a84c",
  training: "#ef4444",
  rest: "#8b5cf6",
  meeting: "#64748b",
  travel: "#94a3b8",
};

function RadialClock() {
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

    NFL_SCHEDULE.forEach((item, i) => {
      const startMin = parseTime(item.time);
      const next = NFL_SCHEDULE[i + 1];
      const endMin = next ? parseTime(next.time) : startMin + 30;

      const startAngle = (startMin / (24 * 60)) * 2 * Math.PI - Math.PI / 2;
      const endAngle = (endMin / (24 * 60)) * 2 * Math.PI - Math.PI / 2;

      svg
        .append("path")
        .datum({ startAngle, endAngle })
        .attr("transform", `translate(${cx}, ${cy})`)
        .attr("d", (d) => arc(d))
        .attr("fill", CATEGORY_COLORS[item.category] || "#666")
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
      .text("NFL Ramadan Day");
  }, []);

  return <svg ref={svgRef} className="w-full max-w-sm mx-auto" />;
}

export default function SchedulePage() {
  return (
    <div>
      <PageHeader title="Daily Schedule" subtitle="A Day of Ramadan during NFL Training Camp" back="/tracker" />

      <div className="px-6 pb-8">
        <Card className="mb-6">
          <RadialClock />
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
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
          {NFL_SCHEDULE.map((item, i) => (
            <Card key={i} delay={i * 0.02} className="flex items-center gap-3 !py-3">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: CATEGORY_COLORS[item.category], opacity: 0.8 }}
              />
              <span className="text-xs font-mono w-16 shrink-0" style={{ color: "var(--muted)" }}>
                {item.time}
              </span>
              <span className="text-sm font-medium">{item.activity}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
