"use client";

import { useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import * as d3 from "d3";
import { useStore, type RingId } from "@/store/useStore";

interface WellnessRingsProps {
  prayers: number;          // 0-5
  hydration: number;        // 0-8
  dhikr: number;            // 0+
  quranJuz?: number;        // 0-30
  seriesCompleted?: number; // completed episodes
  seriesTotal?: number;     // total episodes
  onTap?: () => void;
}

interface RingConfig {
  id: RingId;
  label: string;
  gradFrom: string;
  gradTo: string;
  glow: string;
  href: string;
  baseWeight: number;
}

const RING_CONFIGS: RingConfig[] = [
  { id: "prayers", label: "Prayers", gradFrom: "#e8d48a", gradTo: "#c9a84c", glow: "#c9a84c", href: "/tracker", baseWeight: 5 },
  { id: "water",   label: "Water",   gradFrom: "#93c5fd", gradTo: "#3b82f6", glow: "#60a5fa", href: "/tracker/hydration", baseWeight: 3 },
  { id: "dhikr",   label: "Dhikr",   gradFrom: "#5eead4", gradTo: "#14b8a6", glow: "#2dd4bf", href: "/tracker/tasbeeh", baseWeight: 2 },
  { id: "quran",   label: "Qur'an",  gradFrom: "#c4b5fd", gradTo: "#7c3aed", glow: "#8b5cf6", href: "/tracker/quran", baseWeight: 3 },
  { id: "series",  label: "Series",  gradFrom: "#fda4af", gradTo: "#e11d48", glow: "#f43f5e", href: "/learn/series", baseWeight: 2 },
];

const SIZING: Record<number, { radii: number[]; strokes: number[]; svgSize: number }> = {
  1: { radii: [70], strokes: [10], svgSize: 160 },
  2: { radii: [70, 56], strokes: [10, 8], svgSize: 160 },
  3: { radii: [70, 56, 44], strokes: [10, 8, 6], svgSize: 160 },
  4: { radii: [74, 61, 48, 36], strokes: [9, 8, 7, 6], svgSize: 175 },
  5: { radii: [78, 66, 54, 42, 32], strokes: [8, 7, 6, 5.5, 5], svgSize: 190 },
};

function getRingProgress(id: RingId, props: WellnessRingsProps): { pct: number; display: string } {
  switch (id) {
    case "prayers":
      return { pct: Math.min(props.prayers / 5, 1), display: `${props.prayers}/5` };
    case "water":
      return { pct: Math.min(props.hydration / 8, 1), display: `${props.hydration}/8` };
    case "dhikr":
      return { pct: Math.min(props.dhikr / 99, 1), display: props.dhikr > 99 ? "99+" : `${props.dhikr}` };
    case "quran":
      return { pct: Math.min((props.quranJuz ?? 0) / 30, 1), display: `${props.quranJuz ?? 0}/30` };
    case "series": {
      const total = props.seriesTotal ?? 0;
      const completed = props.seriesCompleted ?? 0;
      return { pct: total > 0 ? Math.min(completed / total, 1) : 0, display: `${completed}/${total}` };
    }
  }
}

export function WellnessRings(props: WellnessRingsProps) {
  const { prayers, hydration, dhikr, quranJuz, seriesCompleted, seriesTotal, onTap } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const enabledRings = useStore((s) => s.enabledRings);

  const activeConfigs = useMemo(
    () => RING_CONFIGS.filter((c) => enabledRings.includes(c.id)),
    [enabledRings]
  );

  const count = activeConfigs.length;
  const { radii, strokes, svgSize } = SIZING[count] ?? SIZING[3];

  // Compute wellness score with dynamic weights
  const wellnessScore = useMemo(() => {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const cfg of activeConfigs) {
      const { pct } = getRingProgress(cfg.id, props);
      weightedSum += pct * cfg.baseWeight;
      totalWeight += cfg.baseWeight;
    }
    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
  }, [activeConfigs, prayers, hydration, dhikr, quranJuz, seriesCompleted, seriesTotal]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cx = svgSize / 2;
    const cy = svgSize / 2;

    // Defs for gradients and glow filters
    const defs = svg.append("defs");

    activeConfigs.forEach((cfg, i) => {
      // Linear gradient
      const grad = defs.append("linearGradient")
        .attr("id", `ring-grad-${cfg.id}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", cfg.gradFrom);
      grad.append("stop").attr("offset", "100%").attr("stop-color", cfg.gradTo);

      // Glow filter (only applied when ring is at 100%)
      const filter = defs.append("filter")
        .attr("id", `ring-glow-${cfg.id}`)
        .attr("x", "-50%").attr("y", "-50%")
        .attr("width", "200%").attr("height", "200%");
      filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "3")
        .attr("result", "blur");
      const merge = filter.append("feMerge");
      merge.append("feMergeNode").attr("in", "blur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    const g = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

    activeConfigs.forEach((cfg, i) => {
      const radius = radii[i];
      const stroke = strokes[i];
      const { pct } = getRingProgress(cfg.id, props);
      const delay = i * 150;

      const arc = d3
        .arc<d3.DefaultArcObject>()
        .innerRadius(radius)
        .outerRadius(radius)
        .startAngle(0)
        .cornerRadius(stroke / 2);

      // Track circle
      g.append("circle")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "var(--ring-track)")
        .attr("stroke-width", stroke)
        .attr("opacity", 0.12);

      // Progress arc
      const path = g
        .append("path")
        .datum({ endAngle: 0 })
        .attr("fill", "none")
        .attr("stroke", `url(#ring-grad-${cfg.id})`)
        .attr("stroke-width", stroke)
        .attr("stroke-linecap", "round")
        .attr("filter", pct >= 1 ? `url(#ring-glow-${cfg.id})` : null)
        .attr("d", (d) => arc({ ...d, startAngle: 0, innerRadius: radius, outerRadius: radius }));

      path
        .transition()
        .delay(delay)
        .duration(800)
        .ease(d3.easeCubicOut)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(0, Math.min(pct, 1) * 2 * Math.PI);
          return (t: number) => {
            d.endAngle = interpolate(t);
            return arc({ ...d, startAngle: 0, innerRadius: radius, outerRadius: radius }) || "";
          };
        });
    });
  }, [activeConfigs, radii, strokes, svgSize, prayers, hydration, dhikr, quranJuz, seriesCompleted, seriesTotal]);

  return (
    <div
      className="flex flex-col items-center gap-3"
      onClick={onTap}
      role={onTap ? "button" : undefined}
      tabIndex={onTap ? 0 : undefined}
      style={{ cursor: onTap ? "pointer" : undefined }}
    >
      <div className="relative inline-flex items-center justify-center">
        <svg ref={svgRef} width={svgSize} height={svgSize} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{wellnessScore}%</span>
          <span className="text-[10px]" style={{ color: "var(--muted)" }}>Today</span>
        </div>
      </div>

      {/* Interactive legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {activeConfigs.map((cfg) => {
          const { display } = getRingProgress(cfg.id, props);
          return (
            <Link
              key={cfg.id}
              href={cfg.href}
              className="inline-link flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.gradTo }} />
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {cfg.label} {display}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
