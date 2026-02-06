"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { path: "/onboarding", label: "Welcome" },
  { path: "/onboarding/step-1", label: "About You" },
  { path: "/onboarding/step-2", label: "Experience" },
  { path: "/onboarding/step-3", label: "Goals" },
  { path: "/onboarding/step-4", label: "Ready" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStepIndex = STEPS.findIndex((s) => s.path === pathname);
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / STEPS.length) * 100 : 0;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 safe-top">
        <div
          className="h-1"
          style={{ background: "var(--surface-1)" }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #c9a84c, #e8c75a)",
            }}
          />
        </div>
        {currentStepIndex > 0 && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              Step {currentStepIndex} of {STEPS.length - 1}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-12">
        {children}
      </div>

      {/* Hide bottom nav styling */}
      <style jsx global>{`
        .bottom-nav {
          display: none !important;
        }
        .safe-bottom {
          padding-bottom: 0 !important;
        }
        header.global-header {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
