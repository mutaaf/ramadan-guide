"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AskCoachHamza } from "@/components/ai/AskCoachHamza";

function AskPageInner() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q") || undefined;

  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
      <PageHeader title="Ask Coach Hamza" subtitle="Your Ramadan questions, answered" back />
      <div className="flex-1 px-6 pb-6">
        <AskCoachHamza initialQuestion={initialQuestion} />
      </div>
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense>
      <AskPageInner />
    </Suspense>
  );
}
