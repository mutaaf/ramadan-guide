"use client";

import Link from "next/link";

interface DeepDiveLinkProps {
  topic: string;
}

export function DeepDiveLink({ topic }: DeepDiveLinkProps) {
  return (
    <Link
      href={`/ask?q=${encodeURIComponent(topic)}`}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all active:scale-[0.97]"
      style={{
        background: "var(--selected-gold-bg)",
        color: "var(--accent-gold)",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      Ask Coach Hamza about this
    </Link>
  );
}
