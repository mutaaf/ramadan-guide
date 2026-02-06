"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DeepDiveLink } from "@/components/ai/DeepDiveLink";
import { LearnNavigation, getLearnNavigation } from "@/components/LearnNavigation";
import { FIVE_PILLARS } from "@/lib/ramadan";

function PillarsChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = 340;
    const h = 220;
    const barWidth = 44;
    const gap = 20;
    const totalWidth = FIVE_PILLARS.length * barWidth + (FIVE_PILLARS.length - 1) * gap;
    const startX = (w - totalWidth) / 2;

    svg.attr("viewBox", `0 0 ${w} ${h}`);

    const heights = [160, 140, 130, 150, 135];
    const colors = ["#c9a84c", "#d4af5e", "#b8943f", "#c9a84c", "#d4af5e"];

    FIVE_PILLARS.forEach((pillar, i) => {
      const x = startX + i * (barWidth + gap);
      const barH = heights[i];
      const y = h - 30 - barH;

      // Bar
      svg
        .append("rect")
        .attr("x", x)
        .attr("y", h - 30)
        .attr("width", barWidth)
        .attr("height", 0)
        .attr("rx", 8)
        .attr("fill", colors[i])
        .attr("opacity", 0.85)
        .transition()
        .delay(i * 120)
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr("y", y)
        .attr("height", barH);

      // Label
      svg
        .append("text")
        .attr("x", x + barWidth / 2)
        .attr("y", h - 12)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--muted)")
        .attr("font-size", "9px")
        .attr("font-weight", "500")
        .attr("opacity", 0)
        .text(pillar.name)
        .transition()
        .delay(i * 120 + 400)
        .duration(400)
        .attr("opacity", 1);

      // Number on top
      svg
        .append("text")
        .attr("x", x + barWidth / 2)
        .attr("y", y + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .attr("font-size", "13px")
        .attr("font-weight", "700")
        .attr("opacity", 0)
        .text(`0${i + 1}`)
        .transition()
        .delay(i * 120 + 600)
        .duration(400)
        .attr("opacity", 0.7);
    });
  }, []);

  return <svg ref={svgRef} className="w-full max-w-sm mx-auto" />;
}

export default function IslamPage() {
  return (
    <div>
      <PageHeader title="What is Islam?" subtitle="Complete submission to the will of God" back="/learn" />

      <div className="px-6 pb-8">
        <Card className="mb-4">
          <PillarsChart />
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm leading-relaxed mb-6 px-1"
          style={{ color: "var(--muted)" }}
        >
          When there is a conflict between what I want and what God commands, I choose
          what God commands. I do everything to the best of my ability. I know God is
          watching and I want to be on my best behavior.
        </motion.p>

        <div className="space-y-3">
          {FIVE_PILLARS.map((pillar, i) => (
            <Card key={pillar.name} delay={0.4 + i * 0.08}>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shrink-0"
                  style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
                >
                  0{i + 1}
                </div>
                <div>
                  <p className="font-semibold text-[15px]">
                    {pillar.name}{" "}
                    <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>
                      ({pillar.phonetic})
                    </span>
                  </p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
                    {pillar.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <DeepDiveLink topic="Tell me more about the Five Pillars of Islam and how they connect to Ramadan" />
        </div>

        <LearnNavigation {...getLearnNavigation("islam")} />
      </div>
    </div>
  );
}
