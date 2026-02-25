"use client";

import { SyncStatusDot } from "@/components/sync/SyncStatusDot";

export function GlobalHeader() {
  return (
    <header
      className="global-header fixed top-0 left-0 right-0 z-50 safe-top md:hidden"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
      }}
    >
      <div
        className="border-b px-6 py-3"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="flex items-center justify-center gap-2">
          <p
            className="text-sm font-semibold tracking-tight text-center"
            style={{ color: "var(--accent-gold)" }}
          >
            Your Personal Ramadan Coach
          </p>
          <SyncStatusDot />
        </div>
      </div>
    </header>
  );
}
