"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop" | "installed";

const DISMISS_KEY = "install-prompt-dismissed";
const VISIT_COUNT_KEY = "install-prompt-visits";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getPlatform(): Platform {
  if (typeof window === "undefined") return "desktop";

  // Check if already installed as PWA
  if (window.matchMedia("(display-mode: standalone)").matches) return "installed";
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone) return "installed";

  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const dismissed = localStorage.getItem(DISMISS_KEY);
  if (!dismissed) return false;
  const dismissedAt = parseInt(dismissed, 10);
  return Date.now() - dismissedAt < DISMISS_DURATION_MS;
}

function setDismissed(): void {
  localStorage.setItem(DISMISS_KEY, Date.now().toString());
}

function getVisitCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
}

function incrementVisitCount(): number {
  const count = getVisitCount() + 1;
  localStorage.setItem(VISIT_COUNT_KEY, count.toString());
  return count;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = useCallback(() => {
    if (dontShowAgain) {
      setDismissed();
    }
    setShow(false);
  }, [dontShowAgain]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDismissed();
    }
    setDeferredPrompt(null);
    setShow(false);
  }, [deferredPrompt]);

  useEffect(() => {
    const detectedPlatform = getPlatform();
    setPlatform(detectedPlatform);

    // Don't show if already installed or on desktop
    if (detectedPlatform === "installed" || detectedPlatform === "desktop") return;

    // Don't show if dismissed recently
    if (isDismissed()) return;

    // Listen for beforeinstallprompt (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Increment visit count
    const visits = incrementVisitCount();

    // Show after 2nd visit or after 30 seconds on first visit
    if (visits >= 2) {
      // Small delay so it doesn't appear immediately
      const timer = setTimeout(() => setShow(true), 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    } else {
      const timer = setTimeout(() => setShow(true), 30000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  // Don't render anything for installed or desktop
  if (platform === "installed" || platform === "desktop") return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-4 mb-4 rounded-3xl overflow-hidden"
            style={{ background: "var(--card)" }}
          >
            <div className="px-6 pt-6 pb-8">
              {/* App Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(201, 168, 76, 0.2), rgba(201, 168, 76, 0.1))",
                    border: "3px solid var(--accent-gold)",
                  }}
                >
                  <span className="text-3xl">🌙</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-center mb-2">Add to Home Screen</h2>
              <p className="text-sm text-center mb-6" style={{ color: "var(--muted)" }}>
                Install this app for quick access and an app-like experience
              </p>

              {platform === "ios" ? (
                <IOSInstructions />
              ) : (
                <AndroidInstructions
                  deferredPrompt={deferredPrompt}
                  onInstall={handleInstall}
                />
              )}

              {/* Don't show again checkbox */}
              <label className="flex items-center justify-center gap-2 mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "var(--accent-gold)" }}
                />
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  Don&apos;t show this again
                </span>
              </label>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="w-full mt-4 py-3 rounded-xl text-sm font-medium transition-opacity active:opacity-70"
                style={{ background: "var(--surface-1)", color: "var(--muted)" }}
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IOSInstructions() {
  return (
    <div className="space-y-4">
      <Step number={1}>
        <div className="flex items-center gap-2">
          <span>Tap the</span>
          <ShareIcon />
          <span className="font-medium">Share</span>
          <span>button</span>
        </div>
      </Step>
      <Step number={2}>
        <span>Scroll down and tap</span>
        <span className="font-medium ml-1">&ldquo;Add to Home Screen&rdquo;</span>
      </Step>
      <Step number={3}>
        <span>Tap</span>
        <span className="font-medium ml-1">&ldquo;Add&rdquo;</span>
        <span className="ml-1">in the top right</span>
      </Step>
    </div>
  );
}

function AndroidInstructions({
  deferredPrompt,
  onInstall,
}: {
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
}) {
  if (deferredPrompt) {
    return (
      <button
        onClick={onInstall}
        className="w-full py-4 rounded-xl text-base font-semibold transition-all active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #c9a84c, #e8c75a, #c9a84c)",
          color: "#000",
          boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
        }}
      >
        Install App
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <Step number={1}>
        <div className="flex items-center gap-2">
          <span>Tap the</span>
          <MenuIcon />
          <span className="font-medium">menu</span>
          <span>button</span>
        </div>
      </Step>
      <Step number={2}>
        <span>Tap</span>
        <span className="font-medium ml-1">&ldquo;Add to Home Screen&rdquo;</span>
        <span className="ml-1">or</span>
        <span className="font-medium ml-1">&ldquo;Install App&rdquo;</span>
      </Step>
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: "var(--selected-gold-bg)", color: "var(--accent-gold)" }}
      >
        {number}
      </div>
      <div className="text-sm" style={{ color: "var(--foreground)" }}>
        {children}
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="20"
      height="20"
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

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color: "var(--accent-gold)" }}
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}
