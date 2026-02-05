"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { PRONUNCIATION_GUIDE } from "@/lib/ramadan";

export default function PronunciationPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Pronunciation" subtitle="23 key Islamic terms" />

      <div className="px-6 pb-8 space-y-2">
        {PRONUNCIATION_GUIDE.map((item, i) => (
          <Card
            key={item.term}
            delay={i * 0.03}
            onClick={() => setExpanded(expanded === item.term ? null : item.term)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold w-6 text-center shrink-0"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-[15px]">{item.term}</p>
                  <p className="text-xs" style={{ color: "var(--accent-gold)" }}>
                    {item.phonetic}
                  </p>
                </div>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{
                  color: "var(--muted)",
                  transform: expanded === item.term ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {expanded === item.term && (
              <p className="text-sm mt-3 pl-9 leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.meaning}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
