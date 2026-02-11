"use client";

import { useStore, createEmptyDay } from "@/store/useStore";
import { getTodayString, getPhaseInfo } from "@/lib/ramadan";

const DAILY_PRAYERS = ["fajr", "dhur", "asr", "maghrib", "ishaa"] as const;

export function PrayerToggles() {
  const { days, togglePrayer } = useStore();
  const today = getTodayString();
  const day = days[today] ?? createEmptyDay(today);
  const phaseInfo = getPhaseInfo();
  const isRamadan = phaseInfo.phase === "ramadan";

  return (
    <div className={`grid gap-1.5 ${isRamadan ? "grid-cols-6" : "grid-cols-5"}`}>
      {DAILY_PRAYERS.map((prayer) => {
        const done = day.prayers[prayer];
        return (
          <button
            key={prayer}
            onClick={() => togglePrayer(today, prayer)}
            className="flex items-center justify-center gap-1 rounded-full py-2 px-1 text-[11px] font-medium capitalize transition-all active:scale-95"
            style={{
              background: done ? "var(--selected-gold-bg)" : "var(--surface-1)",
              color: done ? "var(--accent-gold)" : "var(--muted)",
              border: done ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
            }}
          >
            {done && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {prayer}
          </button>
        );
      })}
      {isRamadan && (
        <button
          onClick={() => togglePrayer(today, "taraweeh")}
          className="flex items-center justify-center gap-1 rounded-full py-2 px-1 text-[11px] font-medium transition-all active:scale-95"
          style={{
            background: day.prayers.taraweeh ? "var(--selected-gold-bg)" : "var(--surface-1)",
            color: day.prayers.taraweeh ? "var(--accent-gold)" : "var(--muted)",
            border: day.prayers.taraweeh ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
          }}
        >
          {day.prayers.taraweeh && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          Taraweeh
        </button>
      )}
    </div>
  );
}
