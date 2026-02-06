"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";
import { getTodayString, HYDRATION_OPTIONS } from "@/lib/ramadan";
import { DeepDiveLink } from "@/components/ai/DeepDiveLink";

function LiquidGauge({ glasses }: { glasses: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = 160;
    const h = 200;
    svg.attr("viewBox", `0 0 ${w} ${h}`);

    const defs = svg.append("defs");

    // Clip path for bottle shape
    const clip = defs.append("clipPath").attr("id", "bottleClip");
    clip
      .append("path")
      .attr("d", `M ${w * 0.3} 30 Q ${w * 0.3} 50 ${w * 0.2} 60 L ${w * 0.2} ${h - 20} Q ${w * 0.2} ${h - 5} ${w * 0.3} ${h - 5} L ${w * 0.7} ${h - 5} Q ${w * 0.8} ${h - 5} ${w * 0.8} ${h - 20} L ${w * 0.8} 60 Q ${w * 0.7} 50 ${w * 0.7} 30 Z`);

    // Bottle outline
    svg
      .append("path")
      .attr("d", `M ${w * 0.3} 30 Q ${w * 0.3} 50 ${w * 0.2} 60 L ${w * 0.2} ${h - 20} Q ${w * 0.2} ${h - 5} ${w * 0.3} ${h - 5} L ${w * 0.7} ${h - 5} Q ${w * 0.8} ${h - 5} ${w * 0.8} ${h - 20} L ${w * 0.8} 60 Q ${w * 0.7} 50 ${w * 0.7} 30 Z`)
      .attr("fill", "none")
      .attr("stroke", "var(--card-border)")
      .attr("stroke-width", 2);

    // Cap
    svg
      .append("rect")
      .attr("x", w * 0.35)
      .attr("y", 15)
      .attr("width", w * 0.3)
      .attr("height", 18)
      .attr("rx", 4)
      .attr("fill", "var(--surface-1)")
      .attr("stroke", "var(--card-border)")
      .attr("stroke-width", 1.5);

    // Water fill
    const fillPercent = glasses / 8;
    const bottleInnerH = h - 65;
    const waterH = bottleInnerH * fillPercent;
    const waterY = h - 5 - waterH - 15;

    const waterGradient = defs.append("linearGradient").attr("id", "waterGrad").attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1");
    waterGradient.append("stop").attr("offset", "0%").attr("stop-color", "#60a5fa").attr("stop-opacity", 0.6);
    waterGradient.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.8);

    svg
      .append("rect")
      .attr("x", w * 0.2)
      .attr("y", h - 20)
      .attr("width", w * 0.6)
      .attr("height", 0)
      .attr("fill", "url(#waterGrad)")
      .attr("clip-path", "url(#bottleClip)")
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("y", waterY)
      .attr("height", waterH + 15);

    // Percentage label
    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", h / 2 + 10)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .attr("font-size", "22px")
      .attr("font-weight", "700")
      .text(`${Math.round(fillPercent * 100)}%`);

    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", h / 2 + 28)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--muted)")
      .attr("font-size", "10px")
      .text(`${glasses * 16}oz / 128oz`);
  }, [glasses]);

  return <svg ref={svgRef} className="mx-auto" style={{ width: 160, height: 200 }} />;
}

export default function HydrationPage() {
  const { getDay, addGlass, removeGlass } = useStore();
  const today = getTodayString();
  const day = getDay(today);

  return (
    <div>
      <PageHeader title="Hydration" subtitle="Track your water intake" back="/tracker" />

      <div className="px-6 pb-8">
        <Card className="mb-6">
          <LiquidGauge glasses={day.glassesOfWater} />

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => removeGlass(today)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold transition-all active:scale-[0.95]"
              style={{ background: "var(--surface-1)", color: "var(--muted)" }}
            >
              -
            </button>
            <div className="text-center">
              <p className="text-3xl font-bold">{day.glassesOfWater}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>of 8 glasses</p>
            </div>
            <button
              onClick={() => addGlass(today)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold transition-all active:scale-[0.95]"
              style={{ background: "var(--accent-blue)", color: "#fff" }}
            >
              +
            </button>
          </div>
        </Card>

        {/* Glass indicators */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all"
              style={{
                background: i < day.glassesOfWater ? "var(--selected-blue-bg)" : "var(--surface-1)",
                border: i < day.glassesOfWater ? "1px solid var(--selected-blue-border)" : "1px solid transparent",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill={i < day.glassesOfWater ? "#3b82f6" : "var(--ring-track)"}>
                <path d="M4 3h12l-1.5 14a2 2 0 01-2 1.8H7.5a2 2 0 01-2-1.8L4 3z" />
              </svg>
              <span className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>16oz</span>
            </div>
          ))}
        </div>

        {/* Hydration Options */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Recommended Drinks
        </div>
        <div className="space-y-2">
          {HYDRATION_OPTIONS.map((option, i) => (
            <Card key={option.name} delay={0.2 + i * 0.04} className="flex items-center justify-between">
              <p className="text-sm font-medium">{option.name}</p>
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: "var(--surface-1)", color: "var(--muted)" }}
              >
                {option.timing}
              </span>
            </Card>
          ))}
        </div>

        <div className="mt-4">
          <DeepDiveLink topic="How do I stay properly hydrated while fasting during Ramadan?" />
        </div>
      </div>
    </div>
  );
}
