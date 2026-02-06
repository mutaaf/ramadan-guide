"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
  color?: string;
}

export function Toggle({ checked, onChange, size = "md", color = "var(--accent-gold)" }: ToggleProps) {
  const sizes = {
    sm: { width: 44, height: 26, knob: 22, offset: 2 },
    md: { width: 51, height: 31, knob: 27, offset: 2 },
  };

  const s = sizes[size];

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative rounded-full transition-colors duration-200 ease-in-out shrink-0"
      style={{
        width: s.width,
        height: s.height,
        backgroundColor: checked ? color : "var(--toggle-track)",
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out"
        style={{
          width: s.knob,
          height: s.knob,
          top: s.offset,
          left: s.offset,
          transform: checked ? `translateX(${s.width - s.knob - s.offset * 2}px)` : "translateX(0)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.08)",
        }}
      />
    </button>
  );
}
