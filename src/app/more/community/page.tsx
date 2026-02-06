"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";
import { CHALLENGES } from "@/lib/ramadan";

export default function CommunityPage() {
  const { challengesCompleted, toggleChallenge } = useStore();
  const done = CHALLENGES.filter((c) => challengesCompleted[c.key]).length;

  return (
    <div>
      <PageHeader title="Community" subtitle="Ramadan is about Community" back="/more" />

      <div className="px-6 pb-8">
        {/* Quote */}
        <Card delay={0.05} className="mb-6">
          <p className="text-sm leading-relaxed italic text-center" style={{ color: "var(--muted)" }}>
            &ldquo;Service to others is the rent you pay for your room here on earth.&rdquo;
          </p>
          <p className="text-xs mt-2 text-center font-medium" style={{ color: "var(--accent-gold)" }}>
            — Muhammad Ali
          </p>
        </Card>

        {/* Challenges */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
            Ramadan Challenge
          </p>
          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
            {done}/{CHALLENGES.length}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {CHALLENGES.map((challenge, i) => (
            <Card
              key={challenge.key}
              delay={0.1 + i * 0.04}
              onClick={() => toggleChallenge(challenge.key)}
              className="flex items-center gap-3"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 transition-all"
                style={{
                  background: challengesCompleted[challenge.key] ? "var(--accent-gold)" : "transparent",
                  border: challengesCompleted[challenge.key] ? "2px solid var(--accent-gold)" : "2px solid var(--ring-track)",
                }}
              >
                {challengesCompleted[challenge.key] && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <p
                className="text-sm font-medium flex-1"
                style={{
                  textDecoration: challengesCompleted[challenge.key] ? "line-through" : "none",
                  color: challengesCompleted[challenge.key] ? "var(--muted)" : "var(--foreground)",
                }}
              >
                {challenge.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Isolation vs Solitude */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Isolation vs Solitude
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card delay={0.5}>
            <p className="text-sm font-semibold mb-2 text-center" style={{ color: "#ef4444" }}>Isolation</p>
            <div className="space-y-1.5">
              {["Feeling Lonely", "Feeling Ostracized", "Feeling like hiding", "Feeling punished"].map((f) => (
                <p key={f} className="text-xs text-center" style={{ color: "var(--muted)" }}>{f}</p>
              ))}
            </div>
          </Card>
          <Card delay={0.55}>
            <p className="text-sm font-semibold mb-2 text-center" style={{ color: "var(--accent-green)" }}>Solitude</p>
            <div className="space-y-1.5">
              {["Feeling Empowered", "Feeling a reset", "Feeling in control", "Feelings of Gratitude"].map((f) => (
                <p key={f} className="text-xs text-center" style={{ color: "var(--muted)" }}>{f}</p>
              ))}
            </div>
          </Card>
        </div>

        {/* Surah Al-Asr */}
        <Card delay={0.6}>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Qur&apos;an — Surah 103 Al-Asr
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
            &ldquo;By the fading day, man is deep in loss, except for those who believe,
            do good deeds, urge one another to the truth, and urge one another to
            steadfastness.&rdquo;
          </p>
        </Card>
      </div>
    </div>
  );
}
