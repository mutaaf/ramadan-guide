"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore, SportType } from "@/store/useStore";

const SPORTS: { value: SportType; label: string; icon: string }[] = [
  { value: "football", label: "Football", icon: "🏈" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "soccer", label: "Soccer", icon: "⚽" },
  { value: "track", label: "Track & Field", icon: "🏃" },
  { value: "swimming", label: "Swimming", icon: "🏊" },
  { value: "mma", label: "MMA / Combat", icon: "🥊" },
  { value: "other", label: "Other Sport", icon: "💪" },
];

export default function OnboardingStep1() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useStore();
  const [name, setName] = useState(userProfile.userName || "");
  const [sport, setSport] = useState<SportType | "">(userProfile.sport || "");
  const [mounted, setMounted] = useState(false);

  // Sync local state with store after hydration
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    setName(userProfile.userName || "");
    setSport(userProfile.sport || "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [userProfile.userName, userProfile.sport]);

  const canContinue = name.trim().length >= 2 && sport !== "";

  const handleContinue = () => {
    if (!canContinue) return;
    updateUserProfile({ userName: name.trim(), sport });
    router.push("/onboarding/step-2");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100dvh-3rem)] flex flex-col px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1"
      >
        <h1 className="text-2xl font-bold mb-2">Tell me about yourself</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          So I can personalize your Ramadan experience
        </p>

        {/* Name Input */}
        <div className="mb-8">
          <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--accent-gold)" }}>
            What should I call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or nickname"
            className="w-full rounded-xl px-4 py-3.5 text-base outline-none transition-all focus:ring-2"
            style={{
              background: "var(--surface-1)",
              color: "var(--foreground)",
            }}
            autoFocus
          />
        </div>

        {/* Sport Selection */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            What&apos;s your sport?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SPORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSport(s.value)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: sport === s.value ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: sport === s.value ? "1px solid var(--accent-gold)" : "1px solid transparent",
                }}
              >
                <span className="text-xl">{s.icon}</span>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="pt-6"
      >
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canContinue
              ? "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)"
              : "var(--surface-1)",
            color: canContinue ? "#000" : "var(--muted)",
          }}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
