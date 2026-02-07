"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export function GeometricPattern() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = 400;
    const h = 400;
    const spacing = 50;

    svg.attr("viewBox", `0 0 ${w} ${h}`);

    const g = svg.append("g").attr("opacity", 0);

    // Create Islamic geometric star patterns
    for (let x = spacing; x < w; x += spacing) {
      for (let y = spacing; y < h; y += spacing) {
        const points = 8;
        const outerR = 18;
        const innerR = 8;

        const starPoints: [number, number][] = [];
        for (let i = 0; i < points * 2; i++) {
          const angle = (i * Math.PI) / points - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          starPoints.push([x + r * Math.cos(angle), y + r * Math.sin(angle)]);
        }

        g.append("polygon")
          .attr("points", starPoints.map((p) => p.join(",")).join(" "))
          .attr("fill", "none")
          .attr("stroke", "var(--accent-gold)")
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.15);

        // Connecting lines
        if (x + spacing < w) {
          g.append("line")
            .attr("x1", x + outerR)
            .attr("y1", y)
            .attr("x2", x + spacing - outerR)
            .attr("y2", y)
            .attr("stroke", "var(--accent-gold)")
            .attr("stroke-width", 0.3)
            .attr("opacity", 0.1);
        }
        if (y + spacing < h) {
          g.append("line")
            .attr("x1", x)
            .attr("y1", y + outerR)
            .attr("x2", x)
            .attr("y2", y + spacing - outerR)
            .attr("stroke", "var(--accent-gold)")
            .attr("stroke-width", 0.3)
            .attr("opacity", 0.1);
        }
      }
    }

    g.transition().duration(1200).ease(d3.easeCubicOut).attr("opacity", 1);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    />
  );
}
