"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const themes = [
  { label: "Qur'an", color: "#c9a84c" },
  { label: "Mercy", color: "#6bb5a0" },
  { label: "Forgiveness", color: "#8b9dc3" },
  { label: "Guidance", color: "#d4af5e" },
  { label: "Fasting", color: "#a8c686" },
  { label: "Charity", color: "#e8a87c" },
  { label: "Love", color: "#c98bb9" },
  { label: "Transition", color: "#7ec8e3" },
];

function ThemeFlower() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = 320;
    const cx = size / 2;
    const cy = size / 2;
    const petalR = 52;
    const centerR = 36;
    const orbitR = 80;

    svg.attr("viewBox", `0 0 ${size} ${size}`);

    const g = svg.append("g");

    // Petals
    themes.forEach((theme, i) => {
      const angle = (i * (2 * Math.PI)) / themes.length - Math.PI / 2;
      const px = cx + orbitR * Math.cos(angle);
      const py = cy + orbitR * Math.sin(angle);

      const petalG = g.append("g");

      petalG
        .append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 0)
        .attr("fill", theme.color)
        .attr("opacity", 0.15)
        .transition()
        .delay(i * 80)
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", petalR);

      petalG
        .append("text")
        .attr("x", px)
        .attr("y", py + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", theme.color)
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("opacity", 0)
        .text(theme.label)
        .transition()
        .delay(i * 80 + 400)
        .duration(400)
        .attr("opacity", 1);
    });

    // Center
    g.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 0)
      .attr("fill", "var(--accent-gold)")
      .attr("opacity", 0.2)
      .transition()
      .delay(200)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("r", centerR);

    g.append("text")
      .attr("x", cx)
      .attr("y", cy + 1)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "var(--accent-gold)")
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .attr("opacity", 0)
      .text("Ramadan")
      .transition()
      .delay(600)
      .duration(400)
      .attr("opacity", 1);
  }, []);

  return <svg ref={svgRef} className="w-full max-w-xs mx-auto" />;
}

export default function RamadanPage() {
  return (
    <div>
      <PageHeader title="What is Ramadan?" subtitle="The Holiest Month of the Year" />

      <div className="px-6 pb-8">
        <Card className="mb-6">
          <ThemeFlower />
        </Card>

        <Card delay={0.2} className="mb-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Ramadan is the ninth month of the Islamic Calendar and considered the Holiest
            month of the year. It is the month in which the Holy Qur&apos;an was revealed and the
            month in which Muslims — from all across the globe — Fast from food and drink
            from sunrise to sunset.
          </p>
        </Card>

        <Card delay={0.3} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            From the Qur&apos;an
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
            &ldquo;You who believe, fasting is prescribed for you, as it was prescribed for
            those before you, so that you may be mindful of God.&rdquo;
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: "var(--accent-gold)" }}>
            — Qur&apos;an, Surah 2, Ayah 183
          </p>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xs font-medium uppercase tracking-wider mb-3 px-1"
          style={{ color: "var(--accent-gold)" }}
        >
          30 Days of Ramadan
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Fasting", desc: "Abstaining from food, drink, vain talk and sexual relations" },
            { label: "Salah", desc: "Pray the five daily prayers on time and in a group" },
            { label: "Qur'an", desc: "Read and recite as much of God's word as the Heart desires" },
            { label: "Dhikr", desc: "Mention the name of God as much as possible" },
            { label: "Sahoor", desc: "Pre-Dawn Meal to begin the Fast" },
            { label: "Iftar", desc: "Sunset Meal to Break the Fast" },
          ].map((item, i) => (
            <Card key={item.label} delay={0.5 + i * 0.06}>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
