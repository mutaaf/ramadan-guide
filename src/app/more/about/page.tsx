"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="About" subtitle="Coach Hamza & this guide" back="/more" />

      <div className="px-6 pb-8">
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
