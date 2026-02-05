"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { TRANSITION_STEPS } from "@/lib/ramadan";

export default function TransitionPage() {
  const [active, setActive] = useState(0);

  return (
    <div>
      <PageHeader title="Transition Guide" subtitle="5 steps to prepare your heart" />

      <div className="px-6 pb-8">
        {/* Stepper dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {TRANSITION_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="transition-all"
              style={{
                width: active === i ? 32 : 8,
                height: 8,
                borderRadius: 4,
                background: active === i ? "var(--accent-gold)" : "var(--ring-track)",
              }}
            />
          ))}
        </div>

        {/* Active Step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <div className="text-center">
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold mb-3"
                  style={{ background: "rgba(201, 168, 76, 0.12)", color: "var(--accent-gold)" }}
                >
                  {TRANSITION_STEPS[active].number}
                </div>
                <h2 className="text-xl font-bold mb-2">{TRANSITION_STEPS[active].title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {TRANSITION_STEPS[active].description}
                </p>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* All steps list */}
        <div className="text-xs font-medium uppercase tracking-wider mb-3 px-1" style={{ color: "var(--accent-gold)" }}>
          All Steps
        </div>
        <div className="space-y-2">
          {TRANSITION_STEPS.map((step, i) => (
            <Card
              key={step.number}
              delay={i * 0.04}
              onClick={() => setActive(i)}
              className="flex items-center gap-3"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0"
                style={{
                  background: active === i ? "var(--accent-gold)" : "rgba(201, 168, 76, 0.12)",
                  color: active === i ? "#000" : "var(--accent-gold)",
                }}
              >
                {step.number}
              </div>
              <p className="text-sm font-medium">{step.title}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
