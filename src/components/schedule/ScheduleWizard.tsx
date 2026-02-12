"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore, ScheduleWizardAnswers, ScheduleBlock } from "@/store/useStore";
import { useAIReady } from "@/lib/ai/hooks";
import { ScheduleGenerationInput, ScheduleGenerationOutput } from "@/lib/ai/types";
import { buildScheduleGenerationPrompts } from "@/lib/ai/prompts/schedule-generation";
import { executeAIRequest } from "@/lib/ai/client";
import { getPrayerTimes, getCachedLocation, formatTime12h } from "@/lib/prayer-times";
import { SchedulePreview } from "./SchedulePreview";

// ─── Types ──────────────────────────────────────────────────────────────────
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | "generating" | "preview";

interface PrayerTimesData {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

// ─── Options ────────────────────────────────────────────────────────────────
const OCCUPATION_OPTIONS = [
  { value: "student", label: "Student", description: "School or university schedule" },
  { value: "working", label: "Working", description: "9-5 or similar job schedule" },
  { value: "athlete", label: "Full-time Athlete", description: "Training is my main focus" },
  { value: "flexible", label: "Flexible/Other", description: "Work from home, freelance, etc." },
  { value: "practicing", label: "Practicing Muslim", description: "Faith-focused, no structured training" },
] as const;

const TRAINING_TIME_OPTIONS = [
  { value: "morning", label: "Morning", description: "Before noon" },
  { value: "afternoon", label: "Afternoon", description: "Between noon and Asr" },
  { value: "evening", label: "Evening", description: "After Asr, near Iftar" },
  { value: "flexible", label: "Flexible", description: "I can train anytime" },
] as const;

const SESSION_LENGTH_OPTIONS = [
  { value: "30 min", label: "30 min", description: "Quick session" },
  { value: "1 hour", label: "1 hour", description: "Standard session" },
  { value: "1.5 hours", label: "1.5 hours", description: "Extended session" },
  { value: "2+ hours", label: "2+ hours", description: "Full training day" },
] as const;

const QURAN_TIME_OPTIONS = [
  { value: 15, label: "15 min", description: "A few pages" },
  { value: 30, label: "30 min", description: "Half a Juz" },
  { value: 60, label: "1 hour", description: "Full Juz" },
  { value: 90, label: "More", description: "Multiple sessions" },
] as const;

const TARAWEEH_OPTIONS = [
  { value: "masjid", label: "At Masjid", description: "Pray in congregation" },
  { value: "home", label: "At Home", description: "Pray at home" },
  { value: "sometimes", label: "Sometimes", description: "Depends on the day" },
  { value: "skip", label: "Skip", description: "Not this Ramadan" },
] as const;

// ─── Helper Components ──────────────────────────────────────────────────────
function RadioOption({
  selected,
  onClick,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98]"
      style={{
        background: selected ? "var(--selected-gold-bg)" : "var(--surface-1)",
        border: selected ? "1px solid var(--accent-gold)" : "1px solid transparent",
      }}
    >
      <div
        className="mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: selected ? "var(--accent-gold)" : "var(--muted)" }}
      >
        {selected && (
          <div className="h-2 w-2 rounded-full" style={{ background: "var(--accent-gold)" }} />
        )}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{description}</p>
      </div>
    </button>
  );
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all"
          style={{
            width: i + 1 === currentStep ? 24 : 8,
            background: i + 1 <= currentStep ? "var(--accent-gold)" : "var(--surface-2)",
          }}
        />
      ))}
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--card-border)",
          color: "var(--foreground)",
        }}
      />
    </div>
  );
}

function SleepSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          Hours of sleep needed
        </label>
        <span className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
          {value}h
        </span>
      </div>
      <input
        type="range"
        min={5}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--accent-gold)]"
        style={{ accentColor: "var(--accent-gold)" }}
      />
      <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--muted)" }}>
        <span>5h</span>
        <span>10h</span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ScheduleWizard() {
  const router = useRouter();
  const { userProfile, setCustomSchedule, apiKey, useApiRoute, aiModelPreference } = useStore();
  const aiReady = useAIReady();

  // State
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);

  // Wizard answers
  const [occupation, setOccupation] = useState<ScheduleWizardAnswers["occupation"]>("flexible");
  const [workHours, setWorkHours] = useState("09:00-17:00");
  const [preferredTime, setPreferredTime] = useState<ScheduleWizardAnswers["preferredTrainingTime"]>("evening");
  const [sessionLength, setSessionLength] = useState("1 hour");
  const [wakeTime, setWakeTime] = useState("04:30");
  const [sleepHours, setSleepHours] = useState(7);
  const [quranMinutes, setQuranMinutes] = useState(30);
  const [taraweeh, setTaraweeh] = useState<ScheduleWizardAnswers["taraweeh"]>("masjid");
  const [specialNotes, setSpecialNotes] = useState("");

  // AI generation state
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleGenerationOutput | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(false);

  // Fetch prayer times on mount
  useEffect(() => {
    setMounted(true);

    const location = getCachedLocation();
    if (location) {
      getPrayerTimes(location.latitude, location.longitude).then((times) => {
        if (times) {
          setPrayerTimes({
            fajr: times.Fajr,
            dhuhr: times.Dhuhr,
            asr: times.Asr,
            maghrib: times.Maghrib,
            isha: times.Isha,
          });
          // Set default wake time to 45 min before Fajr
          const [fH, fM] = times.Fajr.split(":").map(Number);
          let wakeHour = fH;
          let wakeMin = fM - 45;
          if (wakeMin < 0) {
            wakeMin += 60;
            wakeHour -= 1;
          }
          if (wakeHour < 0) wakeHour += 24;
          setWakeTime(`${String(wakeHour).padStart(2, "0")}:${String(wakeMin).padStart(2, "0")}`);
        }
      });
    }
  }, []);

  // Generate schedule function
  const generateSchedule = useCallback(async (times: PrayerTimesData) => {
    if (generationRef.current) return;
    generationRef.current = true;
    setGenerating(true);
    setError(null);

    const input: ScheduleGenerationInput = {
      sport: userProfile.sport || "General fitness",
      trainingIntensity: userProfile.trainingIntensity,
      occupation,
      workHours: occupation === "working" || occupation === "student" ? workHours : undefined,
      preferredTime,
      sessionLength,
      wakeTime,
      sleepHours,
      quranMinutes,
      taraweeh,
      specialNotes: specialNotes || undefined,
      fajr: times.fajr,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha,
    };

    try {
      const { systemPrompt, userPrompt } = buildScheduleGenerationPrompts(input);
      const result = await executeAIRequest<ScheduleGenerationOutput>(
        "schedule-generation",
        input,
        systemPrompt,
        userPrompt,
        {
          apiKey,
          useApiRoute,
          modelOverride: aiModelPreference || undefined,
          maxTokens: 2048,
        }
      );
      setGeneratedSchedule(result.data);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
      generationRef.current = false;
    }
  }, [
    userProfile.sport, userProfile.trainingIntensity, occupation, workHours,
    preferredTime, sessionLength, wakeTime, sleepHours, quranMinutes, taraweeh,
    specialNotes, apiKey, useApiRoute, aiModelPreference
  ]);

  const handleGenerate = () => {
    let times = prayerTimes;
    if (!times) {
      // Use default prayer times
      times = {
        fajr: "05:30",
        dhuhr: "12:15",
        asr: "15:45",
        maghrib: "18:30",
        isha: "20:00",
      };
      setPrayerTimes(times);
    }
    setStep("generating");
    generateSchedule(times);
  };

  const handleSaveSchedule = () => {
    if (!generatedSchedule) return;

    const blocks: ScheduleBlock[] = generatedSchedule.blocks.map((block) => ({
      id: crypto.randomUUID(),
      startTime: block.startTime,
      endTime: block.endTime,
      activity: block.activity,
      category: block.category as ScheduleBlock["category"],
      isFixed: block.isFixed,
    }));

    setCustomSchedule({
      blocks,
      createdAt: Date.now(),
      wizardAnswers: {
        occupation,
        workHours: occupation === "working" || occupation === "student" ? workHours : undefined,
        preferredTrainingTime: preferredTime,
        sessionLength,
        wakeTime,
        sleepHours,
        quranMinutes,
        taraweeh,
        specialNotes: specialNotes || undefined,
      },
      reasoning: generatedSchedule.reasoning,
      tips: generatedSchedule.tips,
    });

    router.push("/tracker/schedule");
  };

  const handleRegenerate = () => {
    setGeneratedSchedule(null);
    setError(null);
    if (prayerTimes) {
      setStep("generating");
      generateSchedule(prayerTimes);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100dvh-3rem)] flex flex-col px-6 py-8">
      <AnimatePresence mode="wait">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1">
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                  style={{ background: "var(--selected-gold-bg)" }}
                >
                  <span role="img" aria-hidden="true">*</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Your Ramadan Coach</h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Assalamu Alaikum! I&apos;m Coach Hamza, your personal Ramadan guide.
                  Let me help you build a daily routine that balances your faith,
                  training, and life commitments.
                </p>
              </div>

              <div
                className="rounded-2xl p-4 mb-6"
                style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: "var(--accent-gold)" }}>
                  Inspired by NFL Training Camp
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  I fasted during 8 NFL seasons while training at the highest level.
                  I&apos;ll use that experience as a baseline and adapt it to YOUR life,
                  InshaAllah.
                </p>
                <Link
                  href="/tracker/schedule"
                  className="inline-block mt-3 text-xs font-medium underline"
                  style={{ color: "var(--accent-gold)" }}
                >
                  View My NFL Schedule
                </Link>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
            >
              Let&apos;s Get Started
            </button>
          </motion.div>
        )}

        {/* Step 2: Daily Commitments */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <StepIndicator currentStep={1} totalSteps={5} />

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold mb-1">Your Daily Life</h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Tell me about your main daily commitment so I can work around it.
                </p>
              </div>

              <div className="space-y-2">
                {OCCUPATION_OPTIONS.map((opt) => (
                  <RadioOption
                    key={opt.value}
                    selected={occupation === opt.value}
                    onClick={() => setOccupation(opt.value)}
                    label={opt.label}
                    description={opt.description}
                  />
                ))}
              </div>

              {(occupation === "working" || occupation === "student") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
                    {occupation === "student" ? "Class hours" : "Work hours"}
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="time"
                      value={workHours.split("-")[0]}
                      onChange={(e) => setWorkHours(`${e.target.value}-${workHours.split("-")[1]}`)}
                      className="flex-1 rounded-xl px-3 py-2.5 text-sm"
                      style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
                    />
                    <span style={{ color: "var(--muted)" }}>to</span>
                    <input
                      type="time"
                      value={workHours.split("-")[1]}
                      onChange={(e) => setWorkHours(`${workHours.split("-")[0]}-${e.target.value}`)}
                      className="flex-1 rounded-xl px-3 py-2.5 text-sm"
                      style={{ background: "var(--surface-1)", border: "1px solid var(--card-border)" }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-black transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Training Preferences */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <StepIndicator currentStep={2} totalSteps={5} />

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold mb-1">Your Training</h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  When do you like to get your training in? I&apos;ll help you time it right.
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Preferred Time
                </label>
                <div className="space-y-2">
                  {TRAINING_TIME_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      selected={preferredTime === opt.value}
                      onClick={() => setPreferredTime(opt.value)}
                      label={opt.label}
                      description={opt.description}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Session Length
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_LENGTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSessionLength(opt.value)}
                      className="rounded-xl px-4 py-3 text-center transition-all active:scale-[0.98]"
                      style={{
                        background: sessionLength === opt.value ? "var(--selected-gold-bg)" : "var(--surface-1)",
                        border: sessionLength === opt.value ? "1px solid var(--accent-gold)" : "1px solid transparent",
                      }}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-black transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Sleep Goals */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <StepIndicator currentStep={3} totalSteps={5} />

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold mb-1">Your Rest</h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Sleep is sacred, both for your body and your ibadah. Let&apos;s protect it.
                </p>
              </div>

              <TimeInput
                value={wakeTime}
                onChange={setWakeTime}
                label={`Wake time for Sahoor${prayerTimes ? ` (Fajr at ${formatTime12h(prayerTimes.fajr)})` : ""}`}
              />

              <SleepSlider value={sleepHours} onChange={setSleepHours} />

              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(99, 102, 241, 0.1)" }}
              >
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  <strong style={{ color: "var(--foreground)" }}>My tip:</strong> Naps are part of
                  the Sunnah! If your total sleep seems hard to achieve, I&apos;ll add a 30-60 min
                  Qaylulah (afternoon nap) after Dhuhr. That&apos;s what got me through NFL camp.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-black transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Spiritual Goals */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <StepIndicator currentStep={4} totalSteps={5} />

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold mb-1">Your Ibadah</h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  This is the heart of Ramadan. Let&apos;s make sure your worship is protected.
                </p>
              </div>

              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Daily Qur&apos;an Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QURAN_TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuranMinutes(opt.value)}
                      className="rounded-xl px-4 py-3 text-center transition-all active:scale-[0.98]"
                      style={{
                        background: quranMinutes === opt.value ? "var(--selected-gold-bg)" : "var(--surface-1)",
                        border: quranMinutes === opt.value ? "1px solid var(--accent-gold)" : "1px solid transparent",
                      }}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                        {opt.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Taraweeh Plans
                </label>
                <div className="space-y-2">
                  {TARAWEEH_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      selected={taraweeh === opt.value}
                      onClick={() => setTaraweeh(opt.value)}
                      label={opt.label}
                      description={opt.description}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setStep(4)}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-black transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 6: Special Considerations */}
        {step === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <StepIndicator currentStep={5} totalSteps={5} />

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold mb-1">Anything Else?</h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Tell me anything else that affects your day. The more I know, the better I can help.
                </p>
              </div>

              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Team meetings on Tuesdays, family time after Maghrib, 30 min commute..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--card-border)",
                  color: "var(--foreground)",
                }}
              />

              {!aiReady && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: "rgba(239, 68, 68, 0.1)" }}
                >
                  <p className="text-xs" style={{ color: "#ef4444" }}>
                    AI features require API configuration. Please check Settings to enable AI schedule generation.
                  </p>
                </div>
              )}

              {prayerTimes && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: "var(--surface-1)" }}
                >
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--accent-gold)" }}>
                    Prayer Times (Auto-detected)
                  </p>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                      { name: "Fajr", time: prayerTimes.fajr },
                      { name: "Dhuhr", time: prayerTimes.dhuhr },
                      { name: "Asr", time: prayerTimes.asr },
                      { name: "Maghrib", time: prayerTimes.maghrib },
                      { name: "Isha", time: prayerTimes.isha },
                    ].map((p) => (
                      <div key={p.name}>
                        <p className="text-[10px]" style={{ color: "var(--muted)" }}>{p.name}</p>
                        <p className="text-xs font-medium">{formatTime12h(p.time)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setStep(5)}
                className="flex-1 rounded-full py-3 text-sm font-medium transition-all active:scale-[0.98]"
                style={{ background: "var(--surface-1)", color: "var(--foreground)" }}
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={!aiReady}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-black transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)" }}
              >
                Build My Routine
              </button>
            </div>
          </motion.div>
        )}

        {/* Generating State */}
        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div
              className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
              style={{ background: "var(--selected-gold-bg)" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--accent-gold)", borderTopColor: "transparent" }}
              />
            </div>
            <h2 className="text-xl font-bold mb-2">Building Your Routine</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              I&apos;m putting together a personalized schedule just for you, InshaAllah...
            </p>

            {error && (
              <div className="mt-6 rounded-xl p-4" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                <p className="text-xs mb-2" style={{ color: "#ef4444" }}>{error}</p>
                <button
                  onClick={handleRegenerate}
                  className="text-xs font-medium underline"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Try again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Preview State */}
        {step === "preview" && generatedSchedule && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <SchedulePreview
              schedule={generatedSchedule}
              onSave={handleSaveSchedule}
              onRegenerate={handleRegenerate}
              onBack={() => setStep(6)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
