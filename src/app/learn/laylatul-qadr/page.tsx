"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DeepDiveLink } from "@/components/ai/DeepDiveLink";
import { LearnNavigation, getLearnNavigation } from "@/components/LearnNavigation";

function NightSky() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = 360;
    const h = 200;
    svg.attr("viewBox", `0 0 ${w} ${h}`);

    // Background gradient
    const defs = svg.append("defs");
    const gradient = defs.append("radialGradient").attr("id", "nightGlow");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#c9a84c").attr("stop-opacity", 0.15);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "transparent").attr("stop-opacity", 0);

    svg.append("rect").attr("width", w).attr("height", h).attr("fill", "var(--surface-1)").attr("rx", 16);
    svg.append("circle").attr("cx", w / 2).attr("cy", h / 2).attr("r", 120).attr("fill", "url(#nightGlow)");

    // Stars
    const starCount = 60;
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.5 + 0.5;

      svg
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 0)
        .attr("fill", "#c9a84c")
        .attr("opacity", 0)
        .transition()
        .delay(Math.random() * 1200)
        .duration(600)
        .attr("r", r)
        .attr("opacity", Math.random() * 0.6 + 0.2);
    }

    // Crescent moon
    const moonG = svg.append("g").attr("transform", `translate(${w / 2}, ${h / 2 - 10})`).attr("opacity", 0);
    moonG.append("circle").attr("r", 28).attr("fill", "#c9a84c").attr("opacity", 0.9);
    moonG.append("circle").attr("cx", 10).attr("cy", -6).attr("r", 24).attr("fill", "var(--surface-1)");
    moonG.transition().delay(400).duration(800).ease(d3.easeCubicOut).attr("opacity", 1);

    // Label
    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", h - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--accent-gold)")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("letter-spacing", "2px")
      .attr("opacity", 0)
      .text("THE NIGHT OF POWER")
      .transition()
      .delay(800)
      .duration(600)
      .attr("opacity", 0.8);
  }, []);

  return <svg ref={svgRef} className="w-full rounded-2xl overflow-hidden" />;
}

export default function LaylaulQadrPage() {
  return (
    <div>
      <PageHeader title="Laylatul Qadr" subtitle="Better than a thousand months" back="/learn" />

      <div className="px-6 pb-8">
        <Card className="mb-4 p-0 overflow-hidden">
          <NightSky />
        </Card>

        <Card delay={0.2} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Surah 97 — Al-Qadr
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
            &ldquo;We sent it down on the Night of Glory. What will explain to you what the
            Night of Glory is? The Night of Glory is better than a thousand months; on that
            night the angels and the Spirit descend again and again with their Lord&apos;s
            permission on every task; there is peace that night until the break of dawn.&rdquo;
          </p>
        </Card>

        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Also referred to as
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {["The Night of Power", "The Night of Decree", "The Night of Destiny", "The Night of Determination"].map((name, i) => (
            <Card key={name} delay={0.3 + i * 0.06}>
              <p className="text-sm font-medium text-center">{name}</p>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <DeepDiveLink topic="How should I maximize my worship during Laylatul Qadr?" />
        </div>

        <LearnNavigation {...getLearnNavigation("laylatul-qadr")} />
      </div>
    </div>
  );
}
