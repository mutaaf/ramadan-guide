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

  const pillClass = isRamadan
    ? "text-[10px] px-1.5 py-2"
    : "text-[11px] px-2 py-2";

  return (
    <div className={`grid gap-1.5 ${isRamadan ? "grid-cols-6" : "grid-cols-5"}`}>
      {DAILY_PRAYERS.map((prayer) => {
        const done = day.prayers[prayer];
        return (
          <button
            key={prayer}
            onClick={() => togglePrayer(today, prayer)}
            className={`flex items-center justify-center gap-1 rounded-full ${pillClass} font-medium capitalize transition-all active:scale-95 overflow-hidden whitespace-nowrap`}
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
            <span className="truncate">{prayer}</span>
          </button>
        );
      })}
      {isRamadan && (
        <button
          onClick={() => togglePrayer(today, "taraweeh")}
          className={`flex items-center justify-center gap-1 rounded-full ${pillClass} font-medium transition-all active:scale-95 overflow-hidden whitespace-nowrap`}
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
          <span className="truncate">Taraweeh</span>
        </button>
      )}
    </div>
  );
}
