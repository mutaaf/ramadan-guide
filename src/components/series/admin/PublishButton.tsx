"use client";

import { useState, useCallback } from "react";
import { useAdminStore } from "@/lib/series/admin-store";

const TOKEN_STORAGE_KEY = "admin-token";

export function PublishButton() {
  const exportToJSON = useAdminStore((s) => s.exportToJSON);
  const setLastPublishedAt = useAdminStore((s) => s.setLastPublishedAt);
  const lastPublishedAt = useAdminStore((s) => s.lastPublishedAt);

  const [status, setStatus] = useState<"idle" | "token-input" | "publishing" | "success" | "error">("idle");
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) ?? "" : ""
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handlePublish = useCallback(async (adminToken: string) => {
    setStatus("publishing");
    setErrorMsg("");

    try {
      const data = exportToJSON();

      const res = await fetch("/api/series/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const result = await res.json();
      setLastPublishedAt(result.publishedAt);
      localStorage.setItem(TOKEN_STORAGE_KEY, adminToken);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, [exportToJSON, setLastPublishedAt]);

  const handleClick = () => {
    if (token) {
      handlePublish(token);
    } else {
      setStatus("token-input");
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      handlePublish(token.trim());
    }
  };

  if (status === "token-input") {
    return (
      <form onSubmit={handleTokenSubmit} className="space-y-2">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter admin token"
          className="w-full text-sm px-4 py-3 rounded-xl"
          style={{
            background: "var(--surface-1)",
            color: "var(--foreground)",
            border: "1px solid var(--card-border)",
          }}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            style={{
              background: "rgba(212, 168, 83, 0.15)",
              color: "var(--accent-gold, #d4a853)",
              border: "1px solid rgba(212, 168, 83, 0.3)",
            }}
          >
            Publish
          </button>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            style={{
              background: "var(--surface-1)",
              color: "var(--muted)",
              border: "1px solid var(--card-border)",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleClick}
        disabled={status === "publishing"}
        className="w-full text-sm font-medium px-4 py-3 rounded-xl transition-colors"
        style={{
          background:
            status === "success"
              ? "rgba(45, 212, 191, 0.12)"
              : status === "error"
                ? "rgba(239, 68, 68, 0.12)"
                : "rgba(212, 168, 83, 0.15)",
          color:
            status === "success"
              ? "var(--accent-teal, #2dd4bf)"
              : status === "error"
                ? "#ef4444"
                : "var(--accent-gold, #d4a853)",
          border:
            status === "success"
              ? "1px solid rgba(45, 212, 191, 0.3)"
              : status === "error"
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(212, 168, 83, 0.3)",
          opacity: status === "publishing" ? 0.7 : 1,
        }}
      >
        {status === "publishing"
          ? "Publishing..."
          : status === "success"
            ? "Published!"
            : status === "error"
              ? "Publish Failed — Tap to Retry"
              : "Publish to Live Site"}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-xs px-1" style={{ color: "#ef4444" }}>
          {errorMsg}
        </p>
      )}
      {lastPublishedAt && status === "idle" && (
        <p className="text-xs px-1" style={{ color: "var(--muted)" }}>
          Last published: {new Date(lastPublishedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
