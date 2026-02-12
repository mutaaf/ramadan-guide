"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FeatureTour } from "@/components/FeatureTour";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReplay = searchParams.get("replay") === "1";

  const handleComplete = () => {
    if (isReplay) {
      router.back();
    } else {
      router.push("/onboarding/step-1");
    }
  };

  return <FeatureTour onComplete={handleComplete} />;
}

export default function OnboardingWelcome() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
