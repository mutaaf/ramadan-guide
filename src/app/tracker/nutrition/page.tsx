"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";
import { getTodayString, getRamadanCountdown } from "@/lib/ramadan";
import { MealRecommendation } from "@/components/ai/MealRecommendation";
import { MealPlanInput } from "@/lib/ai/types";

function PlateChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = 240;
    const radius = 90;
    svg.attr("viewBox", `0 0 ${size} ${size}`);

    const data = [
      { label: "Vegetables", value: 35, color: "#2d6a4f" },
      { label: "Protein", value: 35, color: "#c9a84c" },
      { label: "Carbs", value: 30, color: "#7ec8e3" },
    ];

    const pie = d3.pie<(typeof data)[0]>().value((d) => d.value).sort(null).padAngle(0.03);
    const arc = d3.arc<d3.PieArcDatum<(typeof data)[0]>>().innerRadius(45).outerRadius(radius).cornerRadius(4);

    const g = svg.append("g").attr("transform", `translate(${size / 2}, ${size / 2})`);

    const arcs = g.selectAll("path").data(pie(data)).enter().append("path");

    arcs
      .attr("d", d3.arc<d3.PieArcDatum<(typeof data)[0]>>().innerRadius(45).outerRadius(45).cornerRadius(4) as unknown as string)
      .attr("fill", (d) => d.data.color)
      .attr("opacity", 0.85)
      .transition()
      .delay((_, i) => i * 150)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr("d", arc as unknown as string);

    // Labels
    const labelArc = d3.arc<d3.PieArcDatum<(typeof data)[0]>>().innerRadius(70).outerRadius(70);

    g.selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("opacity", 0)
      .text((d) => d.data.label)
      .transition()
      .delay((_, i) => i * 150 + 400)
      .duration(300)
      .attr("opacity", 1);
  }, []);

  return <svg ref={svgRef} className="mx-auto" style={{ width: 240, height: 240 }} />;
}

const sahoorFoods = ["Dates", "Watermelon", "Grapes", "Orange", "Apple", "Banana", "Avocado"];
const iftarFoods = ["Dates", "Cucumbers", "Salad", "Soup", "Kebab", "Pita", "Sambusas"];

export default function NutritionPage() {
  const { sport, getDay } = useStore();
  const today = getTodayString();
  const day = getDay(today);
  const { dayOfRamadan } = getRamadanCountdown();

  const mealInput = useMemo((): MealPlanInput => ({
    sport,
    trainingType: day.trainingType || "rest",
    hydrationLevel: day.urineColor,
    glassesOfWater: day.glassesOfWater,
    dayOfRamadan,
  }), [sport, day.trainingType, day.urineColor, day.glassesOfWater, dayOfRamadan]);

  return (
    <div>
      <PageHeader title="Nutrition" subtitle="Fuel your fast" />

      <div className="px-6 pb-8">
        <Card className="mb-6">
          <PlateChart />
          <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
            Balance your plate: Vegetables, Protein, Carbohydrates
          </p>
        </Card>

        <Card delay={0.15} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Coach Hamza&apos;s Advice
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            It&apos;s important to have a well balanced plate and eat hydrating foods and fruits
            before loading up on the main course. Focus on foods that help you recover from
            your Training/Competition — as well as your Fasting.
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-green)" }}>
              Sahoor
            </div>
            <div className="space-y-2">
              {sahoorFoods.map((food, i) => (
                <Card key={food} delay={0.2 + i * 0.04}>
                  <p className="text-sm text-center font-medium">{food}</p>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-teal)" }}>
              Iftar
            </div>
            <div className="space-y-2">
              {iftarFoods.map((food, i) => (
                <Card key={food} delay={0.2 + i * 0.04}>
                  <p className="text-sm text-center font-medium">{food}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Card delay={0.5} className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Post Ishaa / Taraweeh
          </p>
          <p className="text-sm font-medium">Protein Shake</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Recovery nutrition after night prayers
          </p>
        </Card>

        {/* AI Meal Recommendation */}
        <MealRecommendation input={mealInput} />
      </div>
    </div>
  );
}
