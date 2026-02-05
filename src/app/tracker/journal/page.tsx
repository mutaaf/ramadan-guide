"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useStore } from "@/store/useStore";
import { getTodayString, getRamadanCountdown } from "@/lib/ramadan";
import { TrainingAdvisor } from "@/components/ai/TrainingAdvisor";
import { ReflectionPrompt } from "@/components/ai/ReflectionPrompt";
import { TrainingAdviceInput, ReflectionInput } from "@/lib/ai/types";

const PRAYERS = ["fajr", "dhur", "asr", "maghrib", "ishaa", "taraweeh"] as const;
const MOODS = ["Relaxed", "Great", "Fun", "Tired", "Sad", "Angry"];
const TRAINING_TYPES = ["practice", "weights", "game", "cardio", "rest", "other"] as const;
const URINE_COLORS = ["#f5f5dc", "#ffffcc", "#ffff99", "#ffee66", "#ffd700", "#e6a800", "#cc8400", "#996300"];

export default function JournalPage() {
  const { getDay, updateDay, togglePrayer, sport } = useStore();
  const today = getTodayString();
  const day = getDay(today);
  const { dayOfRamadan } = getRamadanCountdown();

  const trainingInput = useMemo((): TrainingAdviceInput | null => {
    if (!day.trainingType) return null;
    return {
      trainingType: day.trainingType,
      hoursOfSleep: day.hoursOfSleep,
      feelsRested: day.feelsRested,
      hydrationLevel: day.urineColor,
      glassesOfWater: day.glassesOfWater,
      mood: day.mood,
      sport,
      dayOfRamadan,
      fasted: day.fasted,
    };
  }, [day.trainingType, day.hoursOfSleep, day.feelsRested, day.urineColor, day.glassesOfWater, day.mood, sport, dayOfRamadan, day.fasted]);

  const reflectionInput = useMemo((): ReflectionInput | null => {
    if (!day.mood && !day.surahRead) return null;
    const prayersCompleted = Object.entries(day.prayers)
      .filter(([, v]) => v)
      .map(([k]) => k);
    return {
      mood: day.mood,
      surahRead: day.surahRead,
      firstThought: day.firstThought,
      dayOfRamadan,
      prayersCompleted,
    };
  }, [day.mood, day.surahRead, day.firstThought, day.prayers, dayOfRamadan]);

  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      />

      <div className="px-6 pb-8 space-y-4">
        {/* Fasting Toggle */}
        <Card delay={0.05}>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Fasting Today?</p>
            <button
              onClick={() => updateDay(today, { fasted: !day.fasted })}
              className="relative h-8 w-14 rounded-full transition-colors"
              style={{ background: day.fasted ? "var(--accent-gold)" : "var(--ring-track)" }}
            >
              <div
                className="absolute top-1 h-6 w-6 rounded-full bg-white transition-all shadow-sm"
                style={{ left: day.fasted ? 30 : 2 }}
              />
            </button>
          </div>
        </Card>

        {/* Prayer Tracker */}
        <Card delay={0.1}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Salah
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRAYERS.map((prayer) => (
              <button
                key={prayer}
                onClick={() => togglePrayer(today, prayer)}
                className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all active:scale-[0.97]"
                style={{
                  background: day.prayers[prayer] ? "rgba(201, 168, 76, 0.12)" : "var(--surface-1)",
                  border: day.prayers[prayer] ? "1px solid rgba(201, 168, 76, 0.3)" : "1px solid transparent",
                }}
              >
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center"
                  style={{
                    background: day.prayers[prayer] ? "var(--accent-gold)" : "var(--ring-track)",
                  }}
                >
                  {day.prayers[prayer] && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-medium capitalize">{prayer}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Sleep */}
        <Card delay={0.15}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Sleep
          </p>
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm" style={{ color: "var(--muted)" }}>Hours:</label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={day.hoursOfSleep}
              onChange={(e) => updateDay(today, { hoursOfSleep: parseFloat(e.target.value) })}
              className="flex-1 accent-amber-500"
            />
            <span className="text-sm font-semibold w-8 text-right">{day.hoursOfSleep}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--muted)" }}>Feel Rested?</span>
            <button
              onClick={() => updateDay(today, { feelsRested: !day.feelsRested })}
              className="relative h-7 w-12 rounded-full transition-colors"
              style={{ background: day.feelsRested ? "var(--accent-green)" : "var(--ring-track)" }}
            >
              <div
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all shadow-sm"
                style={{ left: day.feelsRested ? 22 : 2 }}
              />
            </button>
          </div>
        </Card>

        {/* Mood */}
        <Card delay={0.2}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Mood
          </p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => updateDay(today, { mood })}
                className="rounded-full px-4 py-2 text-xs font-medium transition-all"
                style={{
                  background: day.mood === mood ? "rgba(201, 168, 76, 0.15)" : "var(--surface-1)",
                  color: day.mood === mood ? "var(--accent-gold)" : "var(--muted)",
                  border: day.mood === mood ? "1px solid rgba(201, 168, 76, 0.3)" : "1px solid transparent",
                }}
              >
                {mood}
              </button>
            ))}
          </div>
        </Card>

        {/* Urine Color */}
        <Card delay={0.25}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Hydration Check — Urine Color
          </p>
          <div className="flex gap-2">
            {URINE_COLORS.map((color, i) => (
              <button
                key={i}
                onClick={() => updateDay(today, { urineColor: i + 1 })}
                className="flex-1 h-8 rounded-lg transition-all"
                style={{
                  background: color,
                  border: day.urineColor === i + 1 ? "2px solid var(--foreground)" : "2px solid transparent",
                  transform: day.urineColor === i + 1 ? "scale(1.1)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: "var(--muted)" }}>
            Lighter = Better Hydrated
          </p>
        </Card>

        {/* Training */}
        <Card delay={0.3}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Training
          </p>
          <div className="flex flex-wrap gap-2">
            {TRAINING_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => updateDay(today, { trainingType: type })}
                className="rounded-full px-4 py-2 text-xs font-medium capitalize transition-all"
                style={{
                  background: day.trainingType === type ? "rgba(201, 168, 76, 0.15)" : "var(--surface-1)",
                  color: day.trainingType === type ? "var(--accent-gold)" : "var(--muted)",
                  border: day.trainingType === type ? "1px solid rgba(201, 168, 76, 0.3)" : "1px solid transparent",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </Card>

        {/* AI Training Advisor */}
        <TrainingAdvisor input={trainingInput} />

        {/* Meals */}
        <Card delay={0.35}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Meals
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Sahoor</label>
              <input
                type="text"
                placeholder="What did you eat?"
                value={day.sahoorMeal}
                onChange={(e) => updateDay(today, { sahoorMeal: e.target.value })}
                className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Iftar</label>
              <input
                type="text"
                placeholder="What did you eat?"
                value={day.iftarMeal}
                onChange={(e) => updateDay(today, { iftarMeal: e.target.value })}
                className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              />
            </div>
          </div>
        </Card>

        {/* Qur'an & Reflection */}
        <Card delay={0.4}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Reflection
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>First Thought Today</label>
              <input
                type="text"
                placeholder="Bismillah..."
                value={day.firstThought}
                onChange={(e) => updateDay(today, { firstThought: e.target.value })}
                className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Surah Read</label>
              <input
                type="text"
                placeholder="e.g., Ya Seen"
                value={day.surahRead}
                onChange={(e) => updateDay(today, { surahRead: e.target.value })}
                className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Tomorrow, InshaAllah</label>
              <input
                type="text"
                placeholder="Goals for tomorrow..."
                value={day.tomorrowGoals}
                onChange={(e) => updateDay(today, { tomorrowGoals: e.target.value })}
                className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              />
            </div>
          </div>
        </Card>

        {/* AI Reflection & Duaa */}
        <ReflectionPrompt input={reflectionInput} />
      </div>
    </div>
  );
}
