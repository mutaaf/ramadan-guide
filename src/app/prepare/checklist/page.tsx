"use client";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ProgressRing } from "@/components/ProgressRing";
import { useStore } from "@/store/useStore";
import { CHECKLIST_ITEMS } from "@/lib/ramadan";

export default function ChecklistPage() {
  const { checklist, toggleChecklist } = useStore();
  const completed = CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;
  const progress = completed / CHECKLIST_ITEMS.length;

  return (
    <div>
      <PageHeader title="Checklist" subtitle="Prepare for Ramadan" />

      <div className="px-6 pb-8">
        <div className="flex justify-center mb-6">
          <ProgressRing
            progress={progress}
            size={100}
            label={`${completed}/${CHECKLIST_ITEMS.length}`}
            sublabel="Complete"
          />
        </div>

        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item, i) => (
            <Card
              key={item.key}
              delay={i * 0.04}
              onClick={() => toggleChecklist(item.key)}
              className="flex items-center gap-4"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 transition-all"
                style={{
                  background: checklist[item.key]
                    ? "var(--accent-gold)"
                    : "transparent",
                  border: checklist[item.key]
                    ? "2px solid var(--accent-gold)"
                    : "2px solid var(--ring-track)",
                }}
              >
                {checklist[item.key] && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7l3 3 5-6"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <p
                className="text-sm font-medium flex-1"
                style={{
                  textDecoration: checklist[item.key] ? "line-through" : "none",
                  color: checklist[item.key] ? "var(--muted)" : "var(--foreground)",
                }}
              >
                {item.label}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
