"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const CHAIN = [
  { id: "decide", label: "Athlete\nDecides to Fast", short: "Decide" },
  { id: "parents", label: "Speaks with\nParents/Advisors", short: "Parents" },
  { id: "medical", label: "Speaks with\nDoctors & Trainers", short: "Medical" },
  { id: "coaches", label: "Speaks with\nCoaches", short: "Coaches" },
  { id: "research", label: "Team Researches\nOther Athletes", short: "Research" },
  { id: "plan", label: "Create Ramadan\nPlan Together", short: "Plan" },
];

function FlowChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = 340;
    const nodeH = 50;
    const nodeW = 140;
    const gap = 20;
    const totalH = CHAIN.length * (nodeH + gap) + 20;

    svg.attr("viewBox", `0 0 ${w} ${totalH}`);

    CHAIN.forEach((step, i) => {
      const x = (w - nodeW) / 2;
      const y = 10 + i * (nodeH + gap);

      // Connector line
      if (i > 0) {
        svg
          .append("line")
          .attr("x1", w / 2)
          .attr("y1", y - gap)
          .attr("x2", w / 2)
          .attr("y2", y)
          .attr("stroke", "var(--accent-gold)")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4")
          .attr("opacity", 0)
          .transition()
          .delay(i * 150)
          .duration(300)
          .attr("opacity", 0.4);
      }

      // Node
      const g = svg.append("g").attr("opacity", 0);

      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", nodeW)
        .attr("height", nodeH)
        .attr("rx", 14)
        .attr("fill", "var(--surface-1)")
        .attr("stroke", "var(--accent-gold)")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.3);

      // Step number
      g.append("circle")
        .attr("cx", x - 16)
        .attr("cy", y + nodeH / 2)
        .attr("r", 12)
        .attr("fill", "var(--accent-gold)")
        .attr("opacity", 0.15);

      g.append("text")
        .attr("x", x - 16)
        .attr("y", y + nodeH / 2 + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "var(--accent-gold)")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .text(i + 1);

      // Label
      const lines = step.label.split("\n");
      lines.forEach((line, li) => {
        g.append("text")
          .attr("x", x + nodeW / 2)
          .attr("y", y + nodeH / 2 + (li - (lines.length - 1) / 2) * 14)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "var(--foreground)")
          .attr("font-size", "11px")
          .attr("font-weight", li === 0 ? "600" : "400")
          .text(line);
      });

      g.transition()
        .delay(i * 150)
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr("opacity", 1);
    });
  }, []);

  return (
    <div
      role="img"
      aria-label="Communication chain flowchart showing 6 steps: 1. Athlete decides to fast, 2. Speaks with parents/advisors, 3. Speaks with doctors and trainers, 4. Speaks with coaches, 5. Team researches other athletes, 6. Create Ramadan plan together."
    >
      <svg ref={svgRef} className="w-full max-w-sm mx-auto" aria-hidden="true" />
    </div>
  );
}

export default function CommunicationPage() {
  return (
    <div>
      <PageHeader title="Communication" subtitle="Athlete Fasting Communication Chain" back="/prepare" />

      <div className="px-6 pb-8">
        <Card className="mb-6">
          <FlowChart />
        </Card>

        <Card delay={0.3}>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Key Advice
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Communicate with your support group that you intend on fasting during Ramadan.
            This includes coaches, parents, and trainers. Work together to collectively create
            a Ramadan plan that supports your athletic performance.
          </p>
        </Card>
      </div>
    </div>
  );
}
