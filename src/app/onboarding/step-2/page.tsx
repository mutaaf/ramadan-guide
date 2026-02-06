"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore, ExperienceLevel, FastingExperience, TrainingIntensity } from "@/store/useStore";

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "New to combining faith and athletics" },
  { value: "intermediate", label: "Intermediate", description: "Some experience balancing both" },
  { value: "experienced", label: "Experienced", description: "Practiced athlete and Muslim" },
];

const FASTING_EXPERIENCE: { value: FastingExperience; label: string; description: string }[] = [
  { value: "first-time", label: "First Time", description: "This is my first Ramadan fasting" },
  { value: "some-years", label: "A Few Years", description: "I've fasted for 2-5 Ramadans" },
  { value: "many-years", label: "Many Years", description: "Fasting is familiar to me" },
];

const TRAINING_INTENSITY: { value: TrainingIntensity; label: string; description: string }[] = [
  { value: "recreational", label: "Recreational", description: "Casual fitness, stay active" },
  { value: "competitive", label: "Competitive", description: "Regular training and competition" },
  { value: "professional", label: "Professional", description: "Elite/pro-level athlete" },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useStore();
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(userProfile.experienceLevel);
  const [fastingExperience, setFastingExperience] = useState<FastingExperience>(userProfile.fastingExperience);
  const [trainingIntensity, setTrainingIntensity] = useState<TrainingIntensity>(userProfile.trainingIntensity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setExperienceLevel(userProfile.experienceLevel);
    setFastingExperience(userProfile.fastingExperience);
    setTrainingIntensity(userProfile.trainingIntensity);
  }, [userProfile]);

  const handleContinue = () => {
    updateUserProfile({ experienceLevel, fastingExperience, trainingIntensity });
    router.push("/onboarding/step-3");
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
          <h1 className="text-2xl font-bold mb-2">Your Experience</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Help me understand where you&apos;re starting from
          </p>
        </div>

        {/* Islamic Practice Experience */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Islamic Practice Level
          </label>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setExperienceLevel(level.value)}
                className="w-full flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: experienceLevel === level.value ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: experienceLevel === level.value ? "1px solid var(--accent-gold)" : "1px solid transparent",
                }}
              >
                <div
                  className="mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: experienceLevel === level.value ? "var(--accent-gold)" : "var(--muted)",
                  }}
                >
                  {experienceLevel === level.value && (
                    <div className="h-2 w-2 rounded-full" style={{ background: "var(--accent-gold)" }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{level.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{level.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fasting Experience */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Fasting Experience
          </label>
          <div className="space-y-2">
            {FASTING_EXPERIENCE.map((exp) => (
              <button
                key={exp.value}
                onClick={() => setFastingExperience(exp.value)}
                className="w-full flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: fastingExperience === exp.value ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: fastingExperience === exp.value ? "1px solid var(--accent-gold)" : "1px solid transparent",
                }}
              >
                <div
                  className="mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: fastingExperience === exp.value ? "var(--accent-gold)" : "var(--muted)",
                  }}
                >
                  {fastingExperience === exp.value && (
                    <div className="h-2 w-2 rounded-full" style={{ background: "var(--accent-gold)" }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{exp.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{exp.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Training Intensity */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--accent-gold)" }}>
            Training Intensity
          </label>
          <div className="space-y-2">
            {TRAINING_INTENSITY.map((intensity) => (
              <button
                key={intensity.value}
                onClick={() => setTrainingIntensity(intensity.value)}
                className="w-full flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98]"
                style={{
                  background: trainingIntensity === intensity.value ? "var(--selected-gold-bg)" : "var(--surface-1)",
                  border: trainingIntensity === intensity.value ? "1px solid var(--accent-gold)" : "1px solid transparent",
                }}
              >
                <div
                  className="mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: trainingIntensity === intensity.value ? "var(--accent-gold)" : "var(--muted)",
                  }}
                >
                  {trainingIntensity === intensity.value && (
                    <div className="h-2 w-2 rounded-full" style={{ background: "var(--accent-gold)" }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{intensity.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{intensity.description}</p>
                </div>
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
          className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
          }}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
