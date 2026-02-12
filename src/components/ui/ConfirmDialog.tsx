"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
}: ConfirmDialogProps) {
  const confirmColor = variant === "danger" ? "#ef4444" : "var(--accent-gold)";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-sm rounded-2xl p-5 space-y-4"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-base">{title}</h3>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{message}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                className="text-xs font-medium px-4 py-2 rounded-xl"
                style={{ background: "var(--surface-1)" }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="text-xs font-medium px-4 py-2 rounded-xl text-white"
                style={{ background: confirmColor }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
