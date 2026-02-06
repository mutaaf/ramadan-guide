"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { DeepDiveLink } from "@/components/ai/DeepDiveLink";
import { LearnNavigation, getLearnNavigation } from "@/components/LearnNavigation";

const traits = [
  { trait: "Truthful", desc: 'Known as "The Truthful" before Prophethood' },
  { trait: "Grateful", desc: "Grateful in every occurrence" },
  { trait: "Concise", desc: "Concise yet Comprehensive in His Speech" },
  { trait: "Humble", desc: "Power of a King, Personality of a Servant" },
  { trait: "Honoring", desc: "Honored elders, children, neighbors, and orphans" },
  { trait: "Just", desc: "Stood up for the oppressed" },
  { trait: "Loving", desc: "He loved YOU" },
];

export default function ProphetPage() {
  return (
    <div>
      <PageHeader title="Prophet Muhammad" subtitle="May the Peace and Blessings of Allah be upon Him" back="/learn" />

      <div className="px-6 pb-8">
        <Card delay={0.1} className="mb-6">
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Imagine you have a big brother who tells you right from wrong, protects you
            from the greatest threat to your peace, and provides you with a path to
            success. That big brother is Prophet Muhammad. His love, wisdom, leadership,
            mercy, and persistence has allowed us to be Muslims today.
          </p>
          <p className="text-sm mt-3 font-medium" style={{ color: "var(--accent-gold)" }}>
            Alhamdulillah for your big brother and mine.
          </p>
        </Card>

        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Character Traits
        </div>

        <div className="space-y-3">
          {traits.map((t, i) => (
            <Card key={t.trait} delay={0.2 + i * 0.06}>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg shrink-0"
                  style={{ background: "rgba(201, 168, 76, 0.12)" }}
                >
                  <span style={{ color: "var(--accent-gold)" }}>
                    {["H", "S", "C", "K", "R", "J", "L"][i]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.trait}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{t.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card delay={0.8} className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            First Revelation
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--muted)" }}>
            &ldquo;Read! In the name of your Lord who Created. He created man from a
            clinging form. Read! Your Lord is the Most Bountiful One who taught by means
            of the pen, who taught man what he did not know.&rdquo;
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: "var(--accent-gold)" }}>
            — Qur&apos;an 96:1-5
          </p>
        </Card>

        <div className="mt-6">
          <DeepDiveLink topic="Tell me more about Prophet Muhammad and his Sunnah" />
        </div>

        <LearnNavigation {...getLearnNavigation("prophet")} />
      </div>
    </div>
  );
}
