"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const RAMADAN_DUAA = `Allahu Akbar. Allahu Akbar. Allahu Akbar. Allah you are the greatest and the One in whom I beg of your greatness. Ya Allah, you are my Lord, there is no Lord but you and here I am at your service. Ya Allah, accept this from us as you have accepted the efforts of the righteous ones who came before us. Ya Allah join us with the righteous ones among us, the righteous ones who came before us and the righteous ones who will come after us. Ya Allah this is the month of miracles. Ya Allah this is the month in which you sent your most powerful miracle and I thank you for sending us the miracle that you have already written for us in this month of miracles. Ya Allah I love you and I need you. Ya Allah you know best what I am in need of and I thank you for giving me exactly what I need, exactly when I need it. Ya Allah, your promise is true, your plan is perfect, and you are always right on time. Ya Allah, you are the most kind of those who are kind. Ya Allah, you are the most just of those who are just. Ya Allah, you are the most patient of those who are patient. Ya Allah, I beseech you for your kindness, your justice, and your patience. Ya Allah, I long to be with you. Ya Allah, I long to join your Hall of Fame. Ya Allah, I long to have my jersey hanging up in the rafters of Jannah. Ya Allah, I long to be welcomed into Jannah with a standing ovation. Ya Allah, I long to see your Face and to see your Smile. Ya Allah, here I am at your service, fasting for your sake and Your sake alone. Reward us with the reward you have promised us. Forgive us with the forgiveness you have promised us. And accept this with the acceptance you have promised us.`;

const BEGIN_DUAA = "I make my intentions to Fast today, with Faith, Certainty, Mindfulness, and Patience. O Allah, make it easy for me.";
const END_DUAA = "The thirst is gone, the veins are moistened and the reward is certain if Allah wills.";

export default function DuaaPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <PageHeader title="Duaa" subtitle="Begin and end everything with prayer" back="/prepare" />

      <div className="px-6 pb-8">
        {/* Fasting Duaas */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Fasting Duaas
        </div>

        <Card delay={0.1} className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-green)" }}>
              Begin Fast
            </p>
            <button
              onClick={() => copyText(BEGIN_DUAA, "begin")}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: copied === "begin" ? "rgba(201, 168, 76, 0.2)" : "var(--surface-1)",
                color: copied === "begin" ? "var(--accent-gold)" : "var(--muted)",
              }}
            >
              {copied === "begin" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {BEGIN_DUAA}
          </p>
        </Card>

        <Card delay={0.15} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-teal)" }}>
              End Fast
            </p>
            <button
              onClick={() => copyText(END_DUAA, "end")}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: copied === "end" ? "rgba(201, 168, 76, 0.2)" : "var(--surface-1)",
                color: copied === "end" ? "var(--accent-gold)" : "var(--muted)",
              }}
            >
              {copied === "end" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {END_DUAA}
          </p>
        </Card>

        {/* Ramadan Duaa */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          Ramadan Duaa
        </div>

        <Card delay={0.2}>
          <div className="flex items-center justify-end mb-3">
            <button
              onClick={() => copyText(RAMADAN_DUAA, "full")}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: copied === "full" ? "rgba(201, 168, 76, 0.2)" : "var(--surface-1)",
                color: copied === "full" ? "var(--accent-gold)" : "var(--muted)",
              }}
            >
              {copied === "full" ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--muted)" }}>
            {RAMADAN_DUAA}
          </p>
        </Card>
      </div>
    </div>
  );
}
