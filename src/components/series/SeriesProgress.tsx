"use client";

interface SeriesProgressProps {
  completed: number;
  total: number;
  percentage: number;
}

export function SeriesProgress({ completed, total, percentage }: SeriesProgressProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium" style={{ color: "var(--accent-gold)" }}>
          {percentage}% complete
        </span>
        <span className="text-[11px]" style={{ color: "var(--muted)" }}>
          {completed} of {total} episodes
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, background: "var(--accent-gold)" }}
        />
      </div>
    </div>
  );
}
