"use client";

import { CHARITY_CONFIG } from "@/config/charity";
import { Card } from "@/components/Card";

export function CharitySection() {
  if (!CHARITY_CONFIG.enabled || CHARITY_CONFIG.campaigns.length === 0) {
    return null;
  }

  return (
    <>
      <div className="px-1 mb-3">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--accent-gold)" }}
        >
          {CHARITY_CONFIG.sectionTitle}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          {CHARITY_CONFIG.sectionSubtitle}
        </p>
      </div>

      {CHARITY_CONFIG.campaigns.map((campaign, i) => (
        <a
          key={campaign.id}
          href={campaign.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card delay={i * 0.06} className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl shrink-0"
              style={{ background: "var(--selected-gold-bg)" }}
            >
              {campaign.imageEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[15px] truncate">
                  {campaign.name}
                </p>
                {campaign.featured && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      background: "var(--selected-gold-bg)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    Featured
                  </span>
                )}
              </div>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "var(--muted)" }}
              >
                {campaign.description}
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
              style={{ color: "var(--muted)" }}
            >
              <path
                d="M4 12L12 4M12 4H6M12 4v6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Card>
        </a>
      ))}
    </>
  );
}
