"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const sections = [
  { href: "/prepare/checklist", title: "Ramadan Checklist", subtitle: "9 steps to prepare", icon: "C" },
  { href: "/prepare/transition", title: "Transition Guide", subtitle: "5-step framework", icon: "T" },
  { href: "/prepare/communication", title: "Communication Chain", subtitle: "Tell your team", icon: "A" },
  { href: "/prepare/duaa", title: "Ramadan Duaa", subtitle: "Prayer for the month", icon: "D" },
];

export default function PreparePage() {
  return (
    <div>
      <PageHeader title="Prepare" subtitle="Get ready before Ramadan begins" />
      <div className="px-6 pb-8 space-y-3">
        {sections.map((s, i) => (
          <Link key={s.href} href={s.href}>
            <Card delay={i * 0.08} className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold shrink-0"
                style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px]">{s.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.subtitle}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
