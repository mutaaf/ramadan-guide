"use client";

import Link from "next/link";

interface LearnNavigationProps {
  prev?: { slug: string; label: string };
  next?: { slug: string; label: string };
}

const topics = [
  { slug: "islam", label: "What is Islam?" },
  { slug: "ramadan", label: "What is Ramadan?" },
  { slug: "laylatul-qadr", label: "Laylatul Qadr" },
  { slug: "prophet", label: "Prophet Muhammad" },
  { slug: "pronunciation", label: "Pronunciation" },
];

export function LearnNavigation({ prev, next }: LearnNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t" style={{ borderColor: "var(--card-border)" }}>
      {prev ? (
        <Link
          href={`/learn/${prev.slug}`}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] flex-1 min-h-[44px]"
          style={{
            background: "var(--surface-1)",
            color: "var(--foreground)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="truncate">{prev.label}</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={`/learn/${next.slug}`}
          className="flex items-center justify-end gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] flex-1 min-h-[44px]"
          style={{
            background: "var(--selected-gold-bg)",
            color: "var(--accent-gold)",
          }}
        >
          <span className="truncate">{next.label}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      ) : (
        <Link
          href="/learn"
          className="flex items-center justify-end gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] flex-1 min-h-[44px]"
          style={{
            background: "var(--surface-1)",
            color: "var(--foreground)",
          }}
        >
          <span>Back to Learn</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

// Helper function to get prev/next based on current slug
export function getLearnNavigation(currentSlug: string): { prev?: { slug: string; label: string }; next?: { slug: string; label: string } } {
  const currentIndex = topics.findIndex((t) => t.slug === currentSlug);
  if (currentIndex === -1) return {};

  return {
    prev: currentIndex > 0 ? topics[currentIndex - 1] : undefined,
    next: currentIndex < topics.length - 1 ? topics[currentIndex + 1] : undefined,
  };
}
