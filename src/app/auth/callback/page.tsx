"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const mode = url.searchParams.get("mode");

    // Popup mode: send code back to opener and close
    if (mode === "popup" && window.opener) {
      window.opener.postMessage(
        { type: "oauth-callback", code },
        window.location.origin
      );
      window.close();
      return;
    }

    // Normal redirect mode (fallback)
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

      // Verify we have a valid session after exchange
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
