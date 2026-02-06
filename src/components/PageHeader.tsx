"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean | string;
}

export function PageHeader({ title, subtitle, back }: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof back === "string") {
      router.push(back);
    } else {
      router.back();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="px-6 pt-16 pb-4"
    >
      {back && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 mb-2 -ml-1 text-sm font-medium transition-opacity active:opacity-60"
          style={{ color: "var(--accent-gold)" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4L6 9l5 5" />
          </svg>
          Back
        </button>
      )}
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
