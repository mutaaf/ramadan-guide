"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function LoginGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/series/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        localStorage.setItem("admin-token", token);
        onAuthenticated();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Failed to verify. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs space-y-4 rounded-2xl p-6"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="text-center">
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--accent-gold)" }}
          >
            Admin Login
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Enter the admin password to continue
          </p>
        </div>
        <div>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{
              background: "var(--surface-1)",
              border: `1px solid ${error ? "#ef4444" : "var(--card-border)"}`,
              color: "var(--foreground)",
            }}
          />
          {error && (
            <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full text-sm font-medium py-2 rounded-xl disabled:opacity-50"
          style={{ background: "var(--accent-gold)", color: "white" }}
        >
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function AdminSeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(!!localStorage.getItem("admin-token"));
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("admin-token");
    setAuthed(false);
  };

  // Loading state (checking localStorage)
  if (authed === null) {
    return (
      <div
        className="min-h-dvh"
        style={{ background: "var(--background)" }}
      />
    );
  }

  if (!authed) {
    return <LoginGate onAuthenticated={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-dvh" style={{ background: "var(--background)" }}>
      <div
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <Link
          href="/admin/series"
          className="text-sm font-bold"
          style={{ color: "var(--accent-gold)" }}
        >
          Admin
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/learn/series"
            className="text-xs font-medium"
            style={{ color: "var(--muted)" }}
          >
            View Public
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium"
            style={{ color: "var(--muted)" }}
          >
            Sign Out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
