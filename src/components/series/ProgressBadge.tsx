"use client";

interface ProgressBadgeProps {
  completed: boolean;
}

export function ProgressBadge({ completed }: ProgressBadgeProps) {
  if (!completed) return null;
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: "var(--accent-gold)", color: "white" }}
    >
      Completed
    </span>
  );
}
