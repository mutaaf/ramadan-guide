"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="About" subtitle="Coach Hamza & this guide" back="/more" />

      <div className="px-6 pb-8">
        {/* Download Book Card */}
        <Card delay={0.05} className="mb-4">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
              Free Download
            </p>
            <h3 className="text-lg font-bold mb-2">Get the Complete Book</h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              Download Coach Hamza&apos;s Guide for Athletes...in Ramadan as a free PDF.
            </p>
            <a
              href="https://drive.google.com/file/d/14dZVQGAeIvKDSNWyuHHARwkusKmgVue4/view"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black transition-all active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Free PDF
            </a>
          </div>
        </Card>

        <Card delay={0.1} className="mb-4">
          <div className="text-center mb-4">
            <div
              className="inline-flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold mb-3"
              style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
            >
              HA
            </div>
            <h2 className="text-xl font-bold">Hamza Abdullah</h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Retired NFL Player</p>
          </div>

          <div className="space-y-2">
            {[
              "7-Year NFL Career (Buccaneers, Broncos, Browns, Cardinals)",
              "Height: 6'2\" | Weight: 215 lbs",
              "Pomona High School, Washington State University",
              "Fasted during NFL seasons while competing",
              "Public Speaker and Professional Big Brother",
              "Nicknamed 'Coach' during NFL Playing Career",
              "Mentoring Athletes for over 20 Years",
            ].map((line) => (
              <p key={line} className="text-sm" style={{ color: "var(--muted)" }}>{line}</p>
            ))}
          </div>
        </Card>

        <Card delay={0.2} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Inspiration
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            In 1994, during the NBA Finals, Hakeem Olajuwon was observed fasting during Ramadan
            while competing at the highest level. A young Hamza thought, &ldquo;If Hakeem can do
            it, then I can do it.&rdquo; When Ramadan fell during the 2006 NFL season, he fulfilled
            that vow.
          </p>
        </Card>

        <Card delay={0.25} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            About This App
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            This interactive guide is based on &ldquo;Coach Hamza&apos;s Guide for Athletes...in
            Ramadan&rdquo; by Hamza Abdullah. It was built as a free digital companion to help
            athletes on their Ramadan journey.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: "var(--muted)" }}>
            All content faithfully represents Coach Hamza&apos;s original work. Qur&apos;anic
            references use the M.A.S. Abdel Haleem translation (Oxford University Press). Hadith
            references from sunnah.com.
          </p>
        </Card>

        <Card delay={0.3} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Connect
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Social</span>
              <span className="text-sm font-medium">@ProBigBros</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Website</span>
              <span className="text-sm font-medium">ProBigBros.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Email</span>
              <span className="text-sm font-medium">ProBigBros@gmail.com</span>
            </div>
          </div>
        </Card>

        <Card delay={0.35} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Get the Book & Journal
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            The companion journal &ldquo;Coach Hamza&apos;s Journal for Athletes...in Ramadan&rdquo;
            is available for purchase. Use it alongside this app for the complete experience.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            eBook ISBN: 978-0-9981129-6-1 &middot; Paperback ISBN: 978-0-9981129-7-8
          </p>
        </Card>

        <Card delay={0.4} className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Replay App Tour</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Revisit the feature walkthrough
              </p>
            </div>
            <Link
              href="/onboarding?replay=1"
              className="rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95"
              style={{
                background: "var(--selected-gold-bg)",
                color: "var(--accent-gold)",
              }}
            >
              Replay
            </Link>
          </div>
        </Card>

        <Card delay={0.45} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            App Info
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Version</span>
              <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                {process.env.NEXT_PUBLIC_BUILD_HASH || "dev"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Last Updated</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {new Date(process.env.NEXT_PUBLIC_BUILD_DATE || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Copyright &copy; 2024 Hamza Abdullah. All rights reserved.
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Pro Big Bros LLC
          </p>
        </div>
      </div>
    </div>
  );
}
