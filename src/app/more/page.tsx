"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { AISettingsModal } from "@/components/ai/AISettingsModal";
import { CharitySection } from "@/components/CharitySection";

const BOOK_PDF_URL = "https://drive.google.com/file/d/14dZVQGAeIvKDSNWyuHHARwkusKmgVue4/view";

const sections = [
  { href: "/ask", title: "Ask Coach Hamza", subtitle: "AI-powered Q&A about Ramadan", icon: "?" },
  { href: "/prepare", title: "Prepare", subtitle: "Checklist, transition, duaa", icon: "P" },
  { href: "/more/wellness", title: "Wellness", subtitle: "Health, self-care, mental health", icon: "W" },
  { href: "/more/community", title: "Community", subtitle: "Challenges & accountability", icon: "C" },
  { href: "/more/post-ramadan", title: "Post-Ramadan", subtitle: "Eid, maintenance plan", icon: "E" },
  { href: "/more/not-fasting", title: "Not Fasting?", subtitle: "It's still Ramadan", icon: "N" },
  { href: "/more/about", title: "About", subtitle: "Coach Hamza & credits", icon: "A" },
];

export default function MorePage() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <PageHeader title="More" subtitle="Resources, wellness, and community" />
      <div className="px-6 lg:px-8 pb-8 space-y-3 lg:space-y-4">
        {/* AI Settings */}
        <Card delay={0} className="flex items-center gap-4 lg:gap-5" onClick={() => setShowSettings(true)}>
          <div
            className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl text-base font-bold shrink-0"
            style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
          >
            AI
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">AI Settings</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>API key, model, cache</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Card>

        <CharitySection />

        {/* Download Book */}
        <a href={BOOK_PDF_URL} target="_blank" rel="noopener noreferrer">
          <Card delay={0.12} className="flex items-center gap-4 lg:gap-5">
            <div
              className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl shrink-0"
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a)", color: "#000" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[15px]">Download the Book</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Free PDF of Coach Hamza&apos;s Guide</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
              <path d="M4 1l6 7-6 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Card>
        </a>

        {sections.map((s, i) => (
          <Link key={s.href} href={s.href}>
            <Card delay={(i + 1) * 0.06} className="flex items-center gap-4 lg:gap-5">
              <div
                className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl text-base font-bold shrink-0"
                style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
              >
                {s.icon}
              </div>
              <div className="flex-1">
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

      <AISettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
