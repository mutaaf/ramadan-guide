"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface WellnessRingsProps {
  prayers: number; // 0–5
  hydration: number; // 0–8
  dhikr: number; // 0+
  onTap?: () => void;
}

export function WellnessRings({ prayers, hydration, dhikr, onTap }: WellnessRingsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const size = 160;

  const prayerPct = Math.min(prayers / 5, 1);
  const hydrationPct = Math.min(hydration / 8, 1);
  const dhikrPct = Math.min(dhikr / 99, 1);
  const wellnessScore = Math.round(((prayerPct * 0.5) + (hydrationPct * 0.3) + (dhikrPct * 0.2)) * 100);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cx = size / 2;
    const cy = size / 2;
    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

    const rings = [
      { radius: 70, stroke: 10, color: "var(--accent-gold)", progress: prayerPct, delay: 0 },
      { radius: 56, stroke: 8, color: "var(--accent-blue, #60a5fa)", progress: hydrationPct, delay: 150 },
      { radius: 44, stroke: 6, color: "var(--accent-teal, #2dd4bf)", progress: dhikrPct, delay: 300 },
    ];

    rings.forEach(({ radius, stroke, color, progress, delay }) => {
      const arc = d3
        .arc<d3.DefaultArcObject>()
        .innerRadius(radius)
        .outerRadius(radius)
        .startAngle(0)
        .cornerRadius(stroke / 2);

      // Track
      g.append("circle")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "var(--ring-track)")
        .attr("stroke-width", stroke)
        .attr("opacity", 0.3);

      // Progress arc
      const path = g
        .append("path")
        .datum({ endAngle: 0 })
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", stroke)
        .attr("stroke-linecap", "round")
        .attr("d", (d) => arc({ ...d, startAngle: 0, innerRadius: radius, outerRadius: radius }));

      path
        .transition()
        .delay(delay)
        .duration(800)
        .ease(d3.easeCubicOut)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(0, Math.min(progress, 1) * 2 * Math.PI);
          return (t: number) => {
            d.endAngle = interpolate(t);
            return arc({ ...d, startAngle: 0, innerRadius: radius, outerRadius: radius }) || "";
          };
        });
    });
  }, [prayerPct, hydrationPct, dhikrPct]);

  return (
    <div
      className="flex flex-col items-center gap-3"
      onClick={onTap}
      role={onTap ? "button" : undefined}
      tabIndex={onTap ? 0 : undefined}
      style={{ cursor: onTap ? "pointer" : undefined }}
    >
      <div className="relative inline-flex items-center justify-center">
        <svg ref={svgRef} width={size} height={size} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{wellnessScore}%</span>
          <span className="text-[10px]" style={{ color: "var(--muted)" }}>Today</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-gold)" }} />
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>Prayers {prayers}/5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-blue, #60a5fa)" }} />
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>Water {hydration}/8</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-teal, #2dd4bf)" }} />
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>Dhikr {dhikr > 99 ? "99+" : dhikr}</span>
        </div>
      </div>
    </div>
  );
}
