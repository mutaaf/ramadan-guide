"use client";

import { PageHeader } from "@/components/PageHeader";
import { AskCoachHamza } from "@/components/ai/AskCoachHamza";

export default function AskPage() {
  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
      <PageHeader title="Ask Coach Hamza" subtitle="Your Ramadan questions, answered" />
      <div className="flex-1 px-6 pb-6">
        <AskCoachHamza />
      </div>
    </div>
  );
}
