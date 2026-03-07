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

    console.log("[oauth:callback] loaded", {
      code: !!code,
      mode,
      relay,
      hasOpener: !!window.opener,
    });

    // Popup/overlay mode: try postMessage AND always relay
    if (mode === "popup") {
      // Try postMessage (works when window.opener is the actual PWA window)
      if (window.opener) {
        try {
          window.opener.postMessage(
            { type: "oauth-callback", code },
            window.location.origin
          );
          console.log("[oauth:callback] sent postMessage");
        } catch (e) {
          console.warn("[oauth:callback] postMessage failed", e);
        }
      }

      // Relay backup via sendBeacon (survives page close on iOS).
      // Middleware already did this server-side, but belt-and-suspenders.
      if (relay && code) {
        try {
          const blob = new Blob(
            [JSON.stringify({ id: relay, code })],
            { type: "application/json" }
          );
          navigator.sendBeacon("/api/auth/relay", blob);
          console.log("[oauth:callback] sent sendBeacon to relay");
        } catch (e) {
          console.warn("[oauth:callback] sendBeacon failed", e);
        }
      }

      // Use queueMicrotask to avoid synchronous setState in effect body
      queueMicrotask(() => setStatus("done"));
      // Delay close so sendBeacon has time to fire
      setTimeout(() => window.close(), 500);
      return;
    }

    // Normal redirect mode (no popup): exchange code locally
    void (async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || !code) {
        setStatus("error");
        router.replace("/more?sync=error");
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const next = url.searchParams.get("next");
          router.replace(next || "/more?sync=setup");
          return;
        }
      }
      console.error("[oauth:callback] exchange failed:", error?.message);
      setStatus("error");
      router.replace("/more?sync=error");
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
