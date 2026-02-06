"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function NotFastingPage() {
  return (
    <div>
      <PageHeader title="Not Fasting?" subtitle="It's still the month of Ramadan" back="/more" />

      <div className="px-6 pb-8">
        <Card delay={0.1} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Coach Hamza&apos;s Story
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            I fasted every year of my football career except one. During my time with the
            Arizona Cardinals, I found it unusually difficult as I prepared. I asked Allah,
            &ldquo;O Allah... if I am to Fast, then make it easy for me, but if I am not to
            Fast, make it clear to me; so clear that I can&apos;t go any other way.&rdquo;
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
            On the first day of Ramadan, during the first live contact period, my teammate
            Reagan Maui&apos;a — nicknamed &ldquo;The Juggernaut&rdquo; — hit me so hard he gave
            me a concussion. The team trainers told me I couldn&apos;t fast, as part of the
            recovery protocol required monitoring whether I could keep food down.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
            I realized I could now let others know that I wasn&apos;t a superhero. I am human
            and had to break my Fast just like others.
          </p>
        </Card>

        <Card delay={0.2} className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            Important Reminder
          </p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--foreground)" }}>
            Learn the difference between &ldquo;suffering&rdquo; and &ldquo;struggling.&rdquo;
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: "var(--muted)" }}>
            Fasting is a struggle. If you find yourself suffering, break your Fast and seek
            professional help.
          </p>
        </Card>

        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Whether fasting or not — it&apos;s still Ramadan
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Give Charity", icon: "C" },
            { label: "Volunteer", icon: "V" },
            { label: "Clean Up", icon: "U" },
            { label: "Donate", icon: "D" },
          ].map((item, i) => (
            <Card key={item.label} delay={0.3 + i * 0.06}>
              <div className="text-center">
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold mb-2"
                  style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
                >
                  {item.icon}
                </div>
                <p className="text-sm font-medium">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
