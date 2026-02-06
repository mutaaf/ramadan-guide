"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";

function JuzRing({ progress }: { progress: number[] }) {
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

    progress.forEach((pct, i) => {
      const startAngle = i * segAngle + pad - Math.PI / 2;
      const endAngle = (i + 1) * segAngle - pad - Math.PI / 2;

      // Background track
      svg
        .append("path")
        .datum({ startAngle, endAngle })
        .attr("transform", `translate(${cx}, ${cy})`)
        .attr("d", (d) => arcGen(d))
        .attr("fill", "var(--ring-track)")
        .attr("opacity", 0.4);

      // Progress fill (partial or complete)
      if (pct > 0) {
        const fillOpacity = 0.4 + (pct / 100) * 0.45; // 0.4 to 0.85
        svg
          .append("path")
          .datum({ startAngle, endAngle })
          .attr("transform", `translate(${cx}, ${cy})`)
          .attr("d", (d) => arcGen(d))
          .attr("fill", "var(--accent-gold)")
          .attr("opacity", fillOpacity);
      }

      // Juz number
      const midAngle = (startAngle + endAngle) / 2;
      const labelR = (innerR + outerR) / 2;
      svg
        .append("text")
        .attr("x", cx + labelR * Math.cos(midAngle))
        .attr("y", cy + labelR * Math.sin(midAngle))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", pct === 100 ? "#000" : "var(--muted)")
        .attr("font-size", "8px")
        .attr("font-weight", "600")
        .text(i + 1);
    });

    // Center stats
    const doneCount = progress.filter((p) => p === 100).length;
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
  }, [progress]);

  return <svg ref={svgRef} className="w-full max-w-xs mx-auto" />;
}

function ProgressModal({
  juzIndex,
  currentProgress,
  onClose,
  onSave,
}: {
  juzIndex: number;
  currentProgress: number;
  onClose: () => void;
  onSave: (progress: number) => void;
}) {
  const [value, setValue] = useState(currentProgress);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] rounded-2xl p-6 w-[280px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-center mb-4">
          Juz {juzIndex + 1} Progress
        </h3>
        <div className="flex items-center justify-center mb-4">
          <span className="text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>
            {value}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent-gold) ${value}%, var(--ring-track) ${value}%)`,
          }}
        />
        <div className="flex justify-between text-xs mt-1 mb-4" style={{ color: "var(--muted)" }}>
          <span>0%</span>
          <span>100%</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black"
            style={{ background: "var(--accent-gold)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuranPage() {
  const { juzProgress, toggleJuz, setJuzProgress } = useStore();
  const [modalJuz, setModalJuz] = useState<number | null>(null);
  const doneCount = juzProgress.filter((p) => p === 100).length;

  const handleLongPress = (index: number) => {
    setModalJuz(index);
  };

  return (
    <div>
      <PageHeader title="Qur'an" subtitle={`${doneCount}/30 Juz completed`} />

      <div className="px-6 pb-8">
        <Card className="mb-6">
          <JuzRing progress={juzProgress} />
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
          Tap to toggle • Long-press for partial
        </div>
        <div className="grid grid-cols-5 gap-2">
          {juzProgress.map((pct, i) => (
            <JuzButton
              key={i}
              index={i}
              progress={pct}
              onTap={() => toggleJuz(i)}
              onLongPress={() => handleLongPress(i)}
            />
          ))}
        </div>
      </div>

      {modalJuz !== null && (
        <ProgressModal
          juzIndex={modalJuz}
          currentProgress={juzProgress[modalJuz]}
          onClose={() => setModalJuz(null)}
          onSave={(progress) => {
            setJuzProgress(modalJuz, progress);
            setModalJuz(null);
          }}
        />
      )}
    </div>
  );
}

function JuzButton({
  index,
  progress,
  onTap,
  onLongPress,
}: {
  index: number;
  progress: number;
  onTap: () => void;
  onLongPress: () => void;
}) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pressedRef = useRef(false);

  const handleStart = () => {
    pressedRef.current = false;
    timerRef.current = setTimeout(() => {
      pressedRef.current = true;
      onLongPress();
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pressedRef.current) {
      onTap();
    }
  };

  const handleCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const done = progress === 100;
  const partial = progress > 0 && progress < 100;

  return (
    <button
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleCancel}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleCancel}
      className="flex flex-col items-center justify-center rounded-xl py-3 transition-all active:scale-[0.95] relative overflow-hidden"
      style={{
        background: done
          ? "var(--selected-gold-bg)"
          : partial
          ? `linear-gradient(to top, var(--selected-gold-bg) ${progress}%, var(--surface-1) ${progress}%)`
          : "var(--surface-1)",
        border: done || partial ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
      }}
    >
      <span
        className="text-sm font-bold"
        style={{ color: done || partial ? "var(--accent-gold)" : "var(--muted)" }}
      >
        {index + 1}
      </span>
      <span className="text-[9px] mt-0.5" style={{ color: "var(--muted)" }}>
        {partial ? `${progress}%` : "Juz"}
      </span>
    </button>
  );
}
