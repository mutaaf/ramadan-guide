"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Toggle } from "@/components/Toggle";
import { useStore, createEmptyDay } from "@/store/useStore";
import { getTodayString, getRamadanCountdown } from "@/lib/ramadan";
import { TrainingAdvisor } from "@/components/ai/TrainingAdvisor";
import { ReflectionPrompt } from "@/components/ai/ReflectionPrompt";
import { VoiceJournalButton } from "@/components/VoiceJournalButton";
import { TrainingAdviceInput, ReflectionInput } from "@/lib/ai/types";

const PRAYERS = ["fajr", "dhur", "asr", "maghrib", "ishaa", "taraweeh"] as const;
const MOODS = ["Relaxed", "Great", "Fun", "Tired", "Sad", "Angry"];
const TRAINING_TYPES = ["practice", "weights", "game", "cardio", "rest", "other"] as const;
const URINE_COLORS = ["#f5f5dc", "#ffffcc", "#ffff99", "#ffee66", "#ffd700", "#e6a800", "#cc8400", "#996300"];

function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateForInput(dateStr: string): string {
  return dateStr; // Already in YYYY-MM-DD format
}

export default function JournalPage() {
  const { days, updateDay, togglePrayer, sport } = useStore();
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const day = days[selectedDate] ?? createEmptyDay(selectedDate);
  const { dayOfRamadan } = getRamadanCountdown();
  const isToday = selectedDate === today;

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
        subtitle={formatDateForDisplay(selectedDate)}
        back="/tracker"
      />

      <div className="px-6 pb-8 space-y-4">
        {/* Date Selector */}
        <Card delay={0}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const d = new Date(selectedDate + "T12:00:00");
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                style={{ background: "var(--surface-1)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 4l-4 4 4 4" />
                </svg>
              </button>
              <div className="text-center">
                <p className="text-sm font-semibold">{isToday ? "Today" : formatDateForDisplay(selectedDate).split(",")[0]}</p>
                <input
                  type="date"
                  value={formatDateForInput(selectedDate)}
                  max={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs opacity-60 bg-transparent text-center cursor-pointer"
                  style={{ color: "var(--muted)" }}
                />
              </div>
              <button
                onClick={() => {
                  const d = new Date(selectedDate + "T12:00:00");
                  d.setDate(d.getDate() + 1);
                  const newDate = d.toISOString().split("T")[0];
                  if (newDate <= today) setSelectedDate(newDate);
                }}
                disabled={selectedDate >= today}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors disabled:opacity-30"
                style={{ background: "var(--surface-1)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>
            </div>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(today)}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
              >
                Jump to Today
              </button>
            )}
          </div>
        </Card>

        {/* Fasting Toggle */}
        <Card delay={0.05}>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Fasting {isToday ? "Today" : "This Day"}?</p>
            <Toggle
              checked={day.fasted}
              onChange={(v) => updateDay(selectedDate, { fasted: v })}
            />
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
                onClick={() => togglePrayer(selectedDate, prayer)}
                className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all active:scale-[0.97]"
                style={{
                  background: day.prayers[prayer] ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: day.prayers[prayer] ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
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
              onChange={(e) => updateDay(selectedDate, { hoursOfSleep: parseFloat(e.target.value) })}
              className="flex-1 accent-amber-500"
            />
            <span className="text-sm font-semibold w-8 text-right">{day.hoursOfSleep}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--muted)" }}>Feel Rested?</span>
            <Toggle
              checked={day.feelsRested}
              onChange={(v) => updateDay(selectedDate, { feelsRested: v })}
              size="sm"
              color="var(--accent-green)"
            />
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
                onClick={() => updateDay(selectedDate, { mood })}
                className="rounded-full px-4 py-2 text-xs font-medium transition-all"
                style={{
                  background: day.mood === mood ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  color: day.mood === mood ? "var(--accent-gold)" : "var(--muted)",
                  border: day.mood === mood ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
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
                onClick={() => updateDay(selectedDate, { urineColor: i + 1 })}
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
                onClick={() => updateDay(selectedDate, { trainingType: type })}
                className="rounded-full px-4 py-2 text-xs font-medium capitalize transition-all"
                style={{
                  background: day.trainingType === type ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  color: day.trainingType === type ? "var(--accent-gold)" : "var(--muted)",
                  border: day.trainingType === type ? "1px solid var(--selected-gold-border)" : "1px solid transparent",
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
                onChange={(e) => updateDay(selectedDate, { sahoorMeal: e.target.value })}
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
                onChange={(e) => updateDay(selectedDate, { iftarMeal: e.target.value })}
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
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>First Thought {isToday ? "Today" : "That Day"}</label>
              <input
                type="text"
                placeholder="Bismillah..."
                value={day.firstThought}
                onChange={(e) => updateDay(selectedDate, { firstThought: e.target.value })}
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
                onChange={(e) => updateDay(selectedDate, { surahRead: e.target.value })}
                className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>{isToday ? "Tomorrow" : "Next Day"}, InshaAllah</label>
              <input
                type="text"
                placeholder="Goals for tomorrow..."
                value={day.tomorrowGoals}
                onChange={(e) => updateDay(selectedDate, { tomorrowGoals: e.target.value })}
                className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              />
            </div>
          </div>
        </Card>

        {/* AI Reflection & Duaa - only show for today */}
        {isToday && <ReflectionPrompt input={reflectionInput} />}
      </div>

      {/* Voice Journal FAB - only show for today */}
      {isToday && <VoiceJournalButton date={selectedDate} />}
    </div>
  );
}
