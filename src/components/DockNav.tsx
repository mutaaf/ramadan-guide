"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  {
    label: "Home",
    href: "/",
    icon: (active: boolean) => (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "Learn",
    href: "/learn",
    icon: (active: boolean) => (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
      </svg>
    ),
  },
  {
    label: "Track",
    href: "/tracker",
    icon: (active: boolean) => (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    label: "Progress",
    href: "/dashboard",
    icon: (active: boolean) => (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Ask",
    href: "/ask",
    icon: (active: boolean) => (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    label: "More",
    href: "/more",
    icon: (active: boolean) => (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    ),
  },
];

export function DockNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 py-3 rounded-2xl"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div className="flex items-end gap-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href}>
              <motion.div
                whileHover={{ scale: 1.15, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl cursor-pointer"
                style={{
                  color: isActive ? "var(--accent-gold)" : "var(--muted)",
                  background: isActive ? "var(--selected-gold-bg)" : "transparent",
                }}
              >
                {tab.icon(isActive)}
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ background: "var(--accent-gold)" }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
