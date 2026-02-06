"use client";

export function GlobalHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 safe-top"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
      }}
    >
      <div
        className="border-b px-6 py-3"
        style={{ borderColor: "var(--card-border)" }}
      >
        <p
          className="text-sm font-semibold tracking-tight text-center"
          style={{ color: "var(--accent-gold)" }}
        >
          Coach Hamza&apos;s Ramadan Guide
        </p>
      </div>
    </header>
  );
}
