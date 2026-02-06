"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { GeometricPattern } from "@/components/GeometricPattern";

const BOOK_PDF_URL = "https://drive.google.com/file/d/14dZVQGAeIvKDSNWyuHHARwkusKmgVue4/view";

const SPORT_MESSAGES: Record<string, string> = {
  football: "I've been in your cleats. Fasting during the NFL season taught me so much. Let's do this together.",
  basketball: "Like Hakeem Olajuwon inspired me, I hope to inspire you. Ramadan made him stronger—it will do the same for you.",
  soccer: "The beautiful game requires beautiful preparation. Your endurance training during Ramadan will be something special.",
  track: "Speed and stamina come from discipline. Ramadan will sharpen both your body and spirit.",
  swimming: "Hydration is your biggest challenge, but we'll master it together. Your strokes will feel even more purposeful.",
  mma: "The mental strength you build in Ramadan? That's your secret weapon in the cage or ring.",
  other: "Whatever your sport, the principles are the same: prepare well, train smart, and trust in Allah's plan.",
};

export default function OnboardingStep4() {
  const router = useRouter();
  const { userProfile, setOnboarded } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleComplete = () => {
    setOnboarded(true);
    router.push("/");
  };

  if (!mounted) return null;

  const sportMessage = userProfile.sport ? SPORT_MESSAGES[userProfile.sport] : SPORT_MESSAGES.other;
  const firstName = userProfile.userName.split(" ")[0];

  return (
    <div className="relative min-h-[calc(100dvh-3rem)] flex flex-col px-6 py-8 overflow-hidden">
      <GeometricPattern />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold mb-6"
          style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--accent-gold)" }}
        >
          H
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold mb-2"
        >
          MashaAllah, {firstName}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base mb-6"
          style={{ color: "var(--muted)" }}
        >
          You&apos;re ready for an amazing Ramadan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl p-5 mb-6 max-w-sm"
          style={{ background: "var(--surface-1)" }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
            &ldquo;{sportMessage}&rdquo;
          </p>
          <p className="text-xs mt-3 font-medium" style={{ color: "var(--accent-gold)" }}>
            — Coach Hamza
          </p>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-3 gap-3 mb-8 w-full max-w-sm"
        >
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-1)" }}>
            <p className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
              {userProfile.primaryGoals.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Goals</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-1)" }}>
            <p className="text-lg font-bold capitalize" style={{ color: "var(--accent-gold)" }}>
              {userProfile.trainingIntensity.slice(0, 4)}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Level</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-1)" }}>
            <p className="text-lg font-bold capitalize" style={{ color: "var(--accent-gold)" }}>
              {userProfile.sport || "—"}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Sport</p>
          </div>
        </motion.div>

        {/* Download Book */}
        <motion.a
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          href={BOOK_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm mb-8"
          style={{ color: "var(--accent-gold)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download the complete book (PDF)
        </motion.a>
      </motion.div>

      {/* Complete Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10"
      >
        <button
          onClick={handleComplete}
          className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
            boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
          }}
        >
          Start My Journey
        </button>
        <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
          Bismillah — Let&apos;s make this Ramadan count
        </p>
      </motion.div>
    </div>
  );
}
