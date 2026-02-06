"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "Track", href: "/tracker" },
  { label: "Progress", href: "/dashboard" },
  { label: "Ask", href: "/ask" },
  { label: "More", href: "/more" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 items-center justify-between px-8 border-b" style={{ background: "var(--nav-bg)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", borderColor: "var(--card-border)" }}>
      <p className="text-sm font-semibold tracking-tight" style={{ color: "var(--accent-gold)" }}>
        Coach Hamza&apos;s Ramadan Guide
      </p>
      <div className="flex items-center gap-1 rounded-full px-1 py-1" style={{ background: "var(--surface-1)" }}>
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                color: isActive ? "var(--foreground)" : "var(--muted)",
                background: isActive ? "var(--card)" : "transparent",
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
