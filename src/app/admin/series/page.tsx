"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { useAdminStore } from "@/lib/series/admin-store";
import { ExportButton } from "@/components/series/admin/ExportButton";
import { PublishButton } from "@/components/series/admin/PublishButton";

export default function AdminDashboardPage() {
  const { scholars, series, episodes, companions } = useAdminStore();

  const totalEpisodes = Object.values(episodes).reduce((sum, eps) => sum + eps.length, 0);
  const totalCompanions = Object.keys(companions).length;

  return (
    <div className="px-6 py-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Series Admin</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage scholars, series, episodes, and AI companions
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Scholars", value: scholars.length },
          { label: "Series", value: series.length },
          { label: "Episodes", value: totalEpisodes },
          { label: "Companions", value: totalCompanions },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05}>
            <p className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{stat.value}</p>
            <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="space-y-2">
        <Link href="/admin/series/scholars">
          <Card asLink className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Scholars</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {scholars.length} scholars registered
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Card>
        </Link>

        {series.map((sr) => (
          <Link key={sr.id} href={`/admin/series/${sr.id}`}>
            <Card asLink className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{sr.title}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {(episodes[sr.id] ?? []).length} episodes &middot; {sr.status}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--muted)" }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Card>
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <PublishButton />
        <ExportButton />
      </div>
    </div>
  );
}
