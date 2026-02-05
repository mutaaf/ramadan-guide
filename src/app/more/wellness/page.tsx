"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SELF_CARE_TIPS } from "@/lib/ramadan";

const DEHYDRATION_SIGNS = [
  "Dark urine color",
  "Dizziness or lightheadedness",
  "Dry mouth and lips",
  "Fatigue and low energy",
  "Headaches",
  "Rapid heartbeat",
];

const MENTAL_HEALTH_TIERS = [
  { tier: "01", title: "Prayer", desc: "A great way to begin to fill our Spiritual and Mental Health Tank." },
  { tier: "02", title: "Qur'an", desc: "Reading, Reciting, and Listening to the Qur'an can help get us on the path." },
  { tier: "03", title: "Connection", desc: "Connecting with a Spouse, Parent, Sibling, or Friend can greatly improve our health." },
  { tier: "04", title: "Professional", desc: "Speaking with a Mentor, Counselor, or Therapist can aid us in getting back on track." },
];

export default function WellnessPage() {
  return (
    <div>
      <PageHeader title="Wellness" subtitle="Your body has a right over you" />

      <div className="px-6 pb-8">
        {/* Self-Care */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Self-Care Strategies
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {SELF_CARE_TIPS.map((tip, i) => (
            <Card key={tip} delay={i * 0.04}>
              <p className="text-sm font-medium">{tip}</p>
            </Card>
          ))}
        </div>

        {/* Health Warnings */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "#ef4444" }}>
          Dehydration Warning Signs
        </div>
        <Card delay={0.2} className="mb-6">
          <div className="space-y-2">
            {DEHYDRATION_SIGNS.map((sign) => (
              <div key={sign} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#ef4444" }} />
                <p className="text-sm" style={{ color: "var(--muted)" }}>{sign}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Women's Guidance */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Women — Pregnant or Breastfeeding
        </div>
        <Card delay={0.25} className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              "Consult Doctor and/or midwife",
              "The decision to Fast is yours",
              "Talk to mentors",
              "Ask for help",
              "Communicate your needs",
              "Work with a Doula",
              "Hydrate to the best of your ability",
              "Supplements may be needed",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(201, 168, 76, 0.12)" }}
                >
                  <span className="text-[9px] font-bold" style={{ color: "var(--accent-gold)" }}>{i + 1}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{item}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-center mt-4" style={{ color: "var(--accent-gold)" }}>
            Remember you&apos;re doing your best
          </p>
        </Card>

        {/* Mental Health */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Spiritual & Mental Health
        </div>
        <div className="space-y-3 mb-4">
          {MENTAL_HEALTH_TIERS.map((tier, i) => (
            <Card key={tier.title} delay={0.3 + i * 0.06}>
              <div className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0"
                  style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
                >
                  {tier.tier}
                </div>
                <div>
                  <p className="font-semibold text-sm">{tier.title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>{tier.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Meditation */}
        <Card delay={0.5} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Meditation Practice
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            After Sahoor — and before Fajr — pray two rakahs, then spend a few minutes in
            meditation. Seek Allah&apos;s forgiveness, practice gratitude, say
            &ldquo;Alhamdulillah&rdquo; for as many things as you can. Then clear your mind and
            ask Allah for clarity, protection, and guidance.
          </p>
        </Card>

        <Card delay={0.55}>
          <p className="text-sm font-medium text-center" style={{ color: "var(--accent-gold)" }}>
            Mental Health Resource
          </p>
          <p className="text-2xl font-bold text-center mt-1">1-866-Naseeha</p>
          <p className="text-xs text-center mt-1" style={{ color: "var(--muted)" }}>
            Muslim mental health support line
          </p>
        </Card>
      </div>
    </div>
  );
}
