"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  asLink?: boolean;
  delay?: number;
}

export function Card({ children, className = "", onClick, asLink, delay = 0 }: CardProps) {
  const isInteractive = onClick || asLink;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className={`rounded-2xl lg:rounded-3xl p-5 md:p-6 lg:p-7 ${isInteractive ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </motion.div>
  );
}
