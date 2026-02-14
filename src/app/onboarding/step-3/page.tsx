"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

const GOALS = [
  { value: "spiritual-growth", label: "Spiritual Growth", description: "Deepen my connection with Allah" },
  { value: "maintain-fitness", label: "Maintain Fitness", description: "Keep up my athletic performance" },
  { value: "improve-prayer", label: "Improve Prayer", description: "Be more consistent with salah" },
  { value: "read-quran", label: "Read Qur'an", description: "Complete or study the Qur'an" },
  { value: "better-nutrition", label: "Better Nutrition", description: "Eat healthier and smarter" },
  { value: "build-habits", label: "Build Habits", description: "Establish routines that last" },
];

const CONCERNS = [
  { value: "energy", label: "Energy Levels", description: "Worried about feeling tired" },
  { value: "hydration", label: "Hydration", description: "Staying hydrated for training" },
  { value: "performance", label: "Performance", description: "Maintaining athletic ability" },
  { value: "sleep", label: "Sleep Quality", description: "Getting enough rest" },
  { value: "nutrition", label: "Nutrition", description: "Eating enough/right foods" },
  { value: "time", label: "Time Management", description: "Balancing everything" },
];

export default function OnboardingStep3() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useStore();
  const [goals, setGoals] = useState<string[]>(userProfile.primaryGoals);
  const [concerns, setConcerns] = useState<string[]>(userProfile.ramadanConcerns);
  const [mounted, setMounted] = useState(false);

  // Sync local state with store after hydration
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    setGoals(userProfile.primaryGoals);
    setConcerns(userProfile.ramadanConcerns);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [userProfile]);

  const toggleGoal = (value: string) => {
    setGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  };

  const toggleConcern = (value: string) => {
    setConcerns((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const canContinue = goals.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    updateUserProfile({ primaryGoals: goals, ramadanConcerns: concerns });
    router.push("/onboarding/step-4");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100dvh-3rem)] flex flex-col px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 space-y-8"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Goals & Concerns</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            What do you want to achieve and what worries you?
          </p>
        </div>

        {/* Goals - Multi-select */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
            Your Ramadan Goals
          </label>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Select all that apply</p>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((goal) => (
              <button
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className="flex flex-col items-start rounded-xl px-3 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: goals.includes(goal.value) ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: goals.includes(goal.value) ? "1px solid var(--accent-gold)" : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-4 w-4 rounded border-2 flex items-center justify-center"
                    style={{
                      borderColor: goals.includes(goal.value) ? "var(--accent-gold)" : "var(--muted)",
                      background: goals.includes(goal.value) ? "var(--accent-gold)" : "transparent",
                    }}
                  >
                    {goals.includes(goal.value) && (
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l4 4 6-8" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{goal.label}</span>
                </div>
                <p className="text-[11px] pl-6" style={{ color: "var(--muted)" }}>{goal.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Concerns - Multi-select */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
            Any Concerns?
          </label>
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Optional - helps me give better advice</p>
          <div className="grid grid-cols-2 gap-2">
            {CONCERNS.map((concern) => (
              <button
                key={concern.value}
                onClick={() => toggleConcern(concern.value)}
                className="flex flex-col items-start rounded-xl px-3 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: concerns.includes(concern.value) ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: concerns.includes(concern.value) ? "1px solid var(--accent-gold)" : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-4 w-4 rounded border-2 flex items-center justify-center"
                    style={{
                      borderColor: concerns.includes(concern.value) ? "var(--accent-gold)" : "var(--muted)",
                      background: concerns.includes(concern.value) ? "var(--accent-gold)" : "transparent",
                    }}
                  >
                    {concerns.includes(concern.value) && (
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l4 4 6-8" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{concern.label}</span>
                </div>
                <p className="text-[11px] pl-6" style={{ color: "var(--muted)" }}>{concern.description}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Continue Button */}
      <div className="sticky bottom-0 pt-4 pb-6 -mx-6 px-6" style={{ background: "linear-gradient(to top, var(--background) 80%, transparent)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full rounded-full py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canContinue
                ? "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)"
                : "var(--surface-1)",
              color: canContinue ? "#000" : "var(--muted)",
            }}
          >
            Continue
          </button>
          {!canContinue && (
            <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
              Please select at least one goal
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
