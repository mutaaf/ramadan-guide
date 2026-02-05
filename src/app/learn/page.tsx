"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const sections = [
  { href: "/learn/islam", title: "What is Islam?", subtitle: "The Five Pillars", icon: "01" },
  { href: "/learn/ramadan", title: "What is Ramadan?", subtitle: "The Holiest Month", icon: "02" },
  { href: "/learn/laylatul-qadr", title: "Laylatul Qadr", subtitle: "The Night of Power", icon: "03" },
  { href: "/learn/prophet", title: "Prophet Muhammad", subtitle: "Peace be upon Him", icon: "04" },
  { href: "/learn/pronunciation", title: "Pronunciation Guide", subtitle: "23 Key Terms", icon: "05" },
];

export default function LearnPage() {
  return (
    <div>
      <PageHeader title="Learn" subtitle="Foundations of faith and fasting" />
      <div className="px-6 pb-8 space-y-3">
        {sections.map((s, i) => (
          <Link key={s.href} href={s.href}>
            <Card delay={i * 0.08} className="flex items-center gap-4">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold shrink-0"
                style={{ background: "var(--surface-1)", color: "var(--accent-gold)" }}
              >
                {s.icon}
              </motion.div>
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
