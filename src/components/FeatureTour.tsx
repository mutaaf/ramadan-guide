"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { GeometricPattern } from "@/components/GeometricPattern";
import { useInstallPrompt } from "@/components/InstallPrompt";

interface FeatureTourProps {
  onComplete: () => void;
}

const FEATURE_SLIDES = [
  {
    title: "Muslim Wellness for Everyone",
    description:
      "Whether you're an athlete or not, this app helps you build a stronger Ramadan through daily tracking & AI coaching.",
    visual: "pattern" as const,
  },
  {
    title: "Faith Rings",
    description:
      "Track your prayers, Qur'an, and dhikr with beautiful activity rings — see your spiritual progress at a glance.",
    visual: "rings" as const,
  },
  {
    title: "AI Lecture Companion",
    description:
      "Get AI-powered study guides for your favorite Islamic lecture series — notes, reflections, and action items.",
    visual: "lectures" as const,
  },
  {
    title: "Personalize Your Deen",
    description:
      "Correlate your daily habits to your Muslim progression — discover how sleep, hydration, and routine affect your worship.",
    visual: "chart" as const,
  },
];

const INSTALL_SLIDE = {
  title: "Install for the Best Experience",
  description:
    "Add to your home screen for quick access, offline support, and a full-screen app experience. Your progress syncs seamlessly.",
  visual: "install" as const,
};

type SlideVisualType = "pattern" | "rings" | "lectures" | "chart" | "install";

function SlideVisual({ type }: { type: SlideVisualType }) {
  const iconSize = "w-20 h-20";
  const containerClass = `${iconSize} rounded-full mx-auto mb-6 flex items-center justify-center`;

  switch (type) {
    case "pattern":
      return (
        <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(201, 168, 76, 0.1)" }}
          />
          <GeometricPattern />
          <div
            className="absolute inset-0 flex items-center justify-center text-3xl"
            style={{ color: "var(--accent-gold)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>
      );
    case "rings":
      return (
        <div className={containerClass} style={{ background: "rgba(201, 168, 76, 0.1)" }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="var(--accent-gold)" strokeWidth="3" strokeLinecap="round" strokeDasharray="95 31" opacity="0.9" />
            <circle cx="24" cy="24" r="14" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeDasharray="66 22" opacity="0.7" />
            <circle cx="24" cy="24" r="8" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeDasharray="38 12" opacity="0.7" />
          </svg>
        </div>
      );
    case "lectures":
      return (
        <div className={containerClass} style={{ background: "rgba(201, 168, 76, 0.1)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            <path d="M10 8l4 3-4 3V8z" />
          </svg>
        </div>
      );
    case "chart":
      return (
        <div className={containerClass} style={{ background: "rgba(201, 168, 76, 0.1)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            <path d="M3 12h4l3-9 4 18 3-9h4" opacity="0.5" />
          </svg>
        </div>
      );
    case "install":
      return (
        <div className={containerClass} style={{ background: "rgba(201, 168, 76, 0.1)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
            <path d="M8 10l4 4 4-4" />
            <line x1="12" y1="6" x2="12" y2="14" />
          </svg>
        </div>
      );
  }
}

const SWIPE_THRESHOLD = 50;
const DRAG_CONSTRAINT = 30;

export function FeatureTour({ onComplete }: FeatureTourProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { platform, deferredPrompt, handleInstall } = useInstallPrompt();
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  // Build slides: include install slide at position 2 (after welcome) if not already installed
  const SLIDES = platform === "installed"
    ? FEATURE_SLIDES
    : [FEATURE_SLIDES[0], INSTALL_SLIDE, ...FEATURE_SLIDES.slice(1)];

  const isLast = current === SLIDES.length - 1;
  const isInstallSlide = SLIDES[current]?.visual === "install";

  const goTo = (index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Block swiping forward on the install slide — user must tap a CTA
    if (isInstallSlide && info.offset.x < -SWIPE_THRESHOLD) return;
    if (info.offset.x < -SWIPE_THRESHOLD && current < SLIDES.length - 1) {
      goTo(current + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD && current > 0) {
      goTo(current - 1);
    }
  };

  const onInstallClick = async () => {
    const accepted = await handleInstall();
    if (accepted) {
      goTo(current + 1);
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
    }),
  };

  return (
    <div className="relative min-h-[calc(100dvh-3rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(201, 168, 76, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Skip button — hidden on install slide and last slide */}
      {!isLast && !isInstallSlide && (
        <button
          onClick={onComplete}
          className="absolute top-6 right-6 z-20 text-sm font-medium px-3 py-1.5 rounded-full transition-all active:scale-95"
          style={{ color: "var(--muted)" }}
        >
          Skip
        </button>
      )}

      {/* Slide content */}
      <div ref={constraintsRef} className="relative z-10 w-full max-w-sm flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: -DRAG_CONSTRAINT, right: DRAG_CONSTRAINT }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="text-center w-full cursor-grab active:cursor-grabbing select-none"
          >
            <SlideVisual type={SLIDES[current].visual} />

            <motion.p
              className="text-sm font-medium tracking-widest uppercase mb-4"
              style={{ color: "var(--accent-gold)" }}
            >
              {current + 1} of {SLIDES.length}
            </motion.p>

            <h1 className="text-2xl font-bold tracking-tight mb-3">
              {SLIDES[current].title}
            </h1>

            <p
              className="text-sm leading-relaxed max-w-xs mx-auto"
              style={{ color: "var(--muted)" }}
            >
              {SLIDES[current].description}
            </p>

            {/* iOS instructions shown inline on install slide */}
            {isInstallSlide && platform === "ios" && showIOSSteps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 text-left max-w-xs mx-auto space-y-2"
              >
                <InstallStep number={1} text="Tap the Share button" icon={<ShareIcon />} />
                <InstallStep number={2} text={`Tap "Add to Home Screen"`} />
                <InstallStep number={3} text={`Tap "Add"`} />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section: dots + button */}
      <div className="relative z-10 w-full max-w-sm pb-8">
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                background:
                  i === current
                    ? "var(--accent-gold)"
                    : "var(--surface-2)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA button — contextual for install slide */}
        {isInstallSlide ? (
          <div className="space-y-3">
            {platform === "android" && deferredPrompt ? (
              <button
                onClick={onInstallClick}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                  boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
                }}
              >
                Install App
              </button>
            ) : platform === "ios" ? (
              <button
                onClick={() => setShowIOSSteps((v) => !v)}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                  boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
                }}
              >
                {showIOSSteps ? "Got It!" : "How to Install"}
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
                  boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
                }}
              >
                Get Started
              </button>
            )}
            <button
              onClick={() => goTo(current + 1)}
              className="w-full text-sm font-medium py-2 transition-all active:scale-[0.97]"
              style={{ color: "var(--muted)" }}
            >
              Continue in browser
            </button>
          </div>
        ) : isLast ? (
          <button
            onClick={onComplete}
            className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
              boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
            }}
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={() => goTo(current + 1)}
            className="w-full rounded-full py-3.5 text-sm font-semibold text-black transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
            }}
          >
            Next
          </button>
        )}

        {!isInstallSlide && (
          <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
            Swipe to explore
          </p>
        )}
      </div>
    </div>
  );
}

function InstallStep({ number, text, icon }: { number: number; text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
      >
        {number}
      </span>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{text}</span>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--accent-gold)" }}
    >
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
