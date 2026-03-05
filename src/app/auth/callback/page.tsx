"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const mode = url.searchParams.get("mode");
    const relay = url.searchParams.get("relay");

    if (mode === "popup") {
      // Browser popup: window.opener exists → send code via postMessage
      if (window.opener) {
        window.opener.postMessage(
          { type: "oauth-callback", code },
          window.location.origin
        );
        window.close();
        return;
      }

      // PWA in-app sheet: no window.opener, localStorage is NOT shared.
      // Relay the code to the server so the PWA can pick it up and
      // exchange it locally (where the PKCE verifier lives).
      void (async () => {
        if (relay && code) {
          await fetch("/api/auth/relay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: relay, code }),
          }).catch(() => {});
        }
        setStatus("done");
        window.close(); // may be ignored by iOS
      })();
      return;
    }

    // Normal redirect mode (fallback for direct navigation)
    void (async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setStatus("error");
        router.replace("/more?sync=error");
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth/callback] Code exchange failed:", error.message);
          setStatus("error");
          router.replace("/more?sync=error");
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const next = url.searchParams.get("next");
        router.replace(next || "/more?sync=setup");
      } else {
        console.error("[auth/callback] No session after code exchange");
        setStatus("error");
        router.replace("/more?sync=error");
      }
    })();
  }, [router]);

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <div
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
            style={{ background: "rgba(201, 168, 76, 0.15)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>
            Sign-in complete
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            You can close this window and return to the app.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Sign-in failed. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-3">
        <div
          className="w-10 h-10 mx-auto rounded-full animate-pulse"
          style={{ background: "rgba(201, 168, 76, 0.2)" }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--accent-gold)" }}>
          Signing in...
        </p>
      </div>
    </div>
  );
}
