"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    void (async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setStatus("error");
        router.replace("/more?sync=error");
        return;
      }

      // The browser client with detectSessionInUrl: true will automatically
      // exchange the code from the URL hash/params and store the session
      // in localStorage (via our auth storage config).
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setStatus("error");
        router.replace("/more?sync=error");
        return;
      }

      // Verify we actually have a session (code exchange succeeded)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace("/more?sync=setup");
      } else {
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
