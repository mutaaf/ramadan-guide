"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/hooks/useSmartPrompts";

interface CircularSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  size?: number;
  strokeWidth?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  color?: string;
  trackColor?: string;
}

/**
 * Apple-style circular dial for numeric input
 *
 * Drag around the circle to set values with haptic feedback at each step.
 */
export function CircularSlider({
  value,
  min = 0,
  max = 12,
  step = 0.5,
  size = 160,
  strokeWidth = 12,
  onChange,
  label,
  unit = "h",
  color = "var(--accent-blue)",
  trackColor = "var(--surface-2)",
}: CircularSliderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastHapticValue = useRef(value);

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Convert value to angle (0 at top, clockwise)
  const valueToAngle = useCallback((val: number): number => {
    const normalizedValue = (val - min) / (max - min);
    return normalizedValue * 360 - 90; // Start from top (12 o'clock position)
  }, [min, max]);

  // Convert angle to value
  const angleToValue = useCallback((angle: number): number => {
    // Normalize angle to 0-360
    let normalizedAngle = angle + 90;
    if (normalizedAngle < 0) normalizedAngle += 360;
    if (normalizedAngle >= 360) normalizedAngle -= 360;

    const normalizedValue = normalizedAngle / 360;
    const rawValue = min + normalizedValue * (max - min);

    // Snap to step
    const snapped = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, snapped));
  }, [min, max, step]);

  // Handle pointer events
  const getAngleFromEvent = useCallback((clientX: number, clientY: number): number => {
    if (!svgRef.current) return 0;

    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;

    return Math.atan2(y, x) * (180 / Math.PI);
  }, [cx, cy]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const angle = getAngleFromEvent(e.clientX, e.clientY);
    const newValue = angleToValue(angle);
    onChange(newValue);
    triggerHaptic('light');
  }, [getAngleFromEvent, angleToValue, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const angle = getAngleFromEvent(e.clientX, e.clientY);
    const newValue = angleToValue(angle);

    // Trigger haptic on step change
    if (Math.abs(newValue - lastHapticValue.current) >= step) {
      triggerHaptic('light');
      lastHapticValue.current = newValue;
    }

    onChange(newValue);
  }, [isDragging, getAngleFromEvent, angleToValue, onChange, step]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Draw the arc path
  const angle = valueToAngle(value);
  const endAngle = angle + 90; // Convert to standard SVG angle
  const largeArcFlag = endAngle > 180 ? 1 : 0;

  // Calculate end point for the arc
  const endAngleRad = (endAngle * Math.PI) / 180;
  const startX = cx;
  const startY = cy - radius;
  const endX = cx + radius * Math.sin(endAngleRad);
  const endY = cy - radius * Math.cos(endAngleRad);

  // Create arc path
  const arcPath = endAngle > 0
    ? `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
    : "";

  // Calculate knob position
  const knobAngle = (valueToAngle(value) * Math.PI) / 180;
  const knobX = cx + radius * Math.cos(knobAngle);
  const knobY = cy + radius * Math.sin(knobAngle);

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative cursor-pointer touch-none"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <svg
          ref={svgRef}
          width={size}
          height={size}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            opacity={0.5}
          />

          {/* Progress arc */}
          {value > min && (
            <path
              d={arcPath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}

          {/* Hour markers */}
          {Array.from({ length: Math.ceil((max - min) / (step * 2)) + 1 }, (_, i) => {
            const markerValue = min + i * step * 2;
            const markerAngle = ((valueToAngle(markerValue) + 90) * Math.PI) / 180;
            const innerRadius = radius - strokeWidth - 4;
            const outerRadius = radius - strokeWidth / 2;
            const x1 = cx + innerRadius * Math.cos(markerAngle - Math.PI / 2);
            const y1 = cy + innerRadius * Math.sin(markerAngle - Math.PI / 2);
            const x2 = cx + outerRadius * Math.cos(markerAngle - Math.PI / 2);
            const y2 = cy + outerRadius * Math.sin(markerAngle - Math.PI / 2);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--muted)"
                strokeWidth={1.5}
                opacity={0.3}
              />
            );
          })}

          {/* Draggable knob */}
          <motion.circle
            cx={knobX}
            cy={knobY}
            r={strokeWidth / 2 + 4}
            fill="white"
            stroke={color}
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
            animate={{ scale: isDragging ? 1.2 : 1 }}
            transition={{ duration: 0.15 }}
          />
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            className="text-3xl font-bold tabular-nums"
            style={{ color: "var(--foreground)" }}
            key={value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {value}
            <span className="text-lg font-normal" style={{ color: "var(--muted)" }}>
              {unit}
            </span>
          </motion.span>
          {label && (
            <span className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {label}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
