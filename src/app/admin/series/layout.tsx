"use client";

import Link from "next/link";

export default function AdminSeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh" style={{ background: "var(--background)" }}>
      {/* Admin header */}
      <div
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/admin/series"
            className="text-sm font-bold"
            style={{ color: "var(--accent-gold)" }}
          >
            Admin
          </Link>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
            Admin Only
          </span>
        </div>
        <Link
          href="/learn/series"
          className="text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          View Public
        </Link>
      </div>
      {children}
    </div>
  );
}
