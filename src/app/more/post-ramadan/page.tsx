"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const MAINTENANCE = [
  { label: "Fast 3 Days a Month", icon: "F" },
  { label: "Pray 2 Rak'ah of Qiyam a night", icon: "P" },
  { label: "Read 2 Pages of Mushaf after each prayer", icon: "Q" },
  { label: "Donate in small increments monthly", icon: "D" },
  { label: "Dhikr 5-10 minutes after each prayer", icon: "Z" },
];

export default function PostRamadanPage() {
  return (
    <div>
      <PageHeader title="Post-Ramadan" subtitle="Ramadan is the month of Transition" />

      <div className="px-6 pb-8">
        {/* Eid */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Eid Celebrations
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card delay={0.1}>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>Eid Al-Fitr</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Celebrate the end of Ramadan and the breaking of the Fast
              </p>
            </div>
          </Card>
          <Card delay={0.15}>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>Eid Al-Adha</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Celebrate the day of sacrifice during the Hajj pilgrimage
              </p>
            </div>
          </Card>
        </div>

        <Card delay={0.2} className="mb-6 text-center">
          <p className="text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>
            Eid Mubarak
          </p>
        </Card>

        {/* 10% Maintenance Plan */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          10% Maintenance Plan
        </div>
        <Card delay={0.25} className="mb-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Keep the momentum going after Ramadan with this sustainable daily practice.
          </p>
        </Card>
        <div className="space-y-2 mb-6">
          {MAINTENANCE.map((item, i) => (
            <Card key={item.label} delay={0.3 + i * 0.06} className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shrink-0"
                style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
              >
                {item.icon}
              </div>
              <p className="text-sm font-medium">{item.label}</p>
            </Card>
          ))}
        </div>

        {/* Hajj */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Make Intentions for Hajj
        </div>
        <Card delay={0.6}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            Ramadan is the month of Transition. Use this month to make intentions to
            go for Hajj — the pilgrimage to the House of Allah in Mecca, Saudi Arabia.
          </p>
          <p className="text-sm leading-relaxed mt-3 italic" style={{ color: "var(--muted)" }}>
            &ldquo;Pilgrimage to the House is a duty owed to God by people who are able
            to undertake it.&rdquo;
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: "var(--accent-gold)" }}>
            — Qur&apos;an 3:97
          </p>
        </Card>
      </div>
    </div>
  );
}
