"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "var(--accent-gold)",
  label,
  sublabel,
}: ProgressRingProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevProgress = useRef(0);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    const arc = d3
      .arc<d3.DefaultArcObject>()
      .innerRadius(radius)
      .outerRadius(radius)
      .startAngle(0)
      .cornerRadius(strokeWidth / 2);

    const g = svg
      .append("g")
      .attr("transform", `translate(${cx}, ${cy})`);

    // Track
    g.append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "var(--ring-track)")
      .attr("stroke-width", strokeWidth)
      .attr("opacity", 0.6);

    // Progress arc
    const progressPath = g
      .append("path")
      .datum({ endAngle: prevProgress.current * 2 * Math.PI })
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linecap", "round")
      .attr("d", (d) => arc({ ...d, startAngle: 0, innerRadius: radius, outerRadius: radius }));

    progressPath
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attrTween("d", (d) => {
        const interpolate = d3.interpolate(
          d.endAngle,
          Math.min(progress, 1) * 2 * Math.PI
        );
        return (t: number) => {
          d.endAngle = interpolate(t);
          return arc({ ...d, startAngle: 0, innerRadius: radius, outerRadius: radius }) || "";
        };
      });

    prevProgress.current = progress;
  }, [progress, size, strokeWidth, color]);

  const percentComplete = Math.round(progress * 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="progressbar"
      aria-valuenow={percentComplete}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label || "Progress"}: ${percentComplete}% complete${sublabel ? `, ${sublabel}` : ""}`}
    >
      <svg ref={svgRef} width={size} height={size} aria-hidden="true" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-lg font-semibold">{label}</span>
        )}
        {sublabel && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
