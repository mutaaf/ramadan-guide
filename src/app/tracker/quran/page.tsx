"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";

function JuzRing({ completed }: { completed: boolean[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const outerR = 120;
    const innerR = 85;

    svg.attr("viewBox", `0 0 ${size} ${size}`);

    const arcGen = d3
      .arc<{ startAngle: number; endAngle: number }>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .cornerRadius(2);

    const segAngle = (2 * Math.PI) / 30;
    const pad = 0.02;

    completed.forEach((done, i) => {
      const startAngle = i * segAngle + pad - Math.PI / 2;
      const endAngle = (i + 1) * segAngle - pad - Math.PI / 2;

      svg
        .append("path")
        .datum({ startAngle, endAngle })
        .attr("transform", `translate(${cx}, ${cy})`)
        .attr("d", (d) => arcGen(d))
        .attr("fill", done ? "var(--accent-gold)" : "var(--ring-track)")
        .attr("opacity", done ? 0.85 : 0.4)
        .attr("cursor", "pointer");

      // Juz number
      const midAngle = (startAngle + endAngle) / 2;
      const labelR = (innerR + outerR) / 2;
      svg
        .append("text")
        .attr("x", cx + labelR * Math.cos(midAngle))
        .attr("y", cy + labelR * Math.sin(midAngle))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", done ? "#000" : "var(--muted)")
        .attr("font-size", "8px")
        .attr("font-weight", "600")
        .text(i + 1);
    });

    // Center stats
    const doneCount = completed.filter(Boolean).length;
    svg
      .append("text")
      .attr("x", cx)
      .attr("y", cy - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .attr("font-size", "28px")
      .attr("font-weight", "700")
      .text(`${doneCount}`);

    svg
      .append("text")
      .attr("x", cx)
      .attr("y", cy + 12)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--muted)")
      .attr("font-size", "11px")
      .text("of 30 Juz");
  }, [completed]);

  return <svg ref={svgRef} className="w-full max-w-xs mx-auto" />;
}

export default function QuranPage() {
  const { juzCompleted, toggleJuz } = useStore();
  const doneCount = juzCompleted.filter(Boolean).length;

  return (
    <div>
      <PageHeader title="Qur'an" subtitle={`${doneCount}/30 Juz completed`} />

      <div className="px-6 pb-8">
        <Card className="mb-6">
          <JuzRing completed={juzCompleted} />
        </Card>

        <Card delay={0.15} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            From the Book
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
            &ldquo;Make no mistake about it, Ramadan is THE MONTH OF THE QUR&apos;AN.&rdquo;
          </p>
        </Card>

        {/* Grid of Juz */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Tap to mark complete
        </div>
        <div className="grid grid-cols-5 gap-2">
          {juzCompleted.map((done, i) => (
            <button
              key={i}
              onClick={() => toggleJuz(i)}
              className="flex flex-col items-center justify-center rounded-xl py-3 transition-all active:scale-[0.95]"
              style={{
                background: done ? "rgba(201, 168, 76, 0.15)" : "var(--surface-1)",
                border: done ? "1px solid rgba(201, 168, 76, 0.3)" : "1px solid transparent",
              }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: done ? "var(--accent-gold)" : "var(--muted)" }}
              >
                {i + 1}
              </span>
              <span className="text-[9px] mt-0.5" style={{ color: "var(--muted)" }}>
                Juz
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
