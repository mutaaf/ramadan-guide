import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DB_SCHEMA = "ramadan_guide";
const AUTH_STORAGE_KEY = "ramadan-guide-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any, any, any> | null = null;

export function getSupabaseBrowserClient() {
  if (client) return client;
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  client = createClient(url, key, {
    db: { schema: DB_SCHEMA },
    auth: {
      flowType: "pkce",
      storage: window.localStorage,
      storageKey: AUTH_STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

/** Returns true when Supabase env vars are configured */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Clear auth tokens from localStorage */
export function clearAuthStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Sign in with OAuth using a popup/overlay.
 *
 * Uses a unified wait strategy that listens on ALL three channels
 * simultaneously (postMessage + relay polling + visibility check).
 * This avoids the iOS PWA deadlock where window.open() returns a
 * non-null in-app overlay that doesn't share localStorage.
 */
export async function signInWithPopup(
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const relayId = crypto.randomUUID();
  console.log("[oauth] starting sign-in", { provider, relayId });

  // Get OAuth URL (stores PKCE verifier in localStorage)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?mode=popup&relay=${relayId}`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error("[oauth] failed to get OAuth URL", error);
    return { success: false, error: error?.message ?? "Failed to get OAuth URL" };
  }

  // Open OAuth URL directly (on iOS PWA this opens an in-app overlay or Safari)
  const popup = window.open(data.url, "oauth-popup");
  console.log("[oauth] window.open result:", popup ? "non-null" : "null");

  if (!popup) {
    // null = opened in external browser (iOS PWA). That's fine — relay will handle it.
    console.log("[oauth] popup is null, will rely on relay + visibility");
  }

  return waitForAuth(supabase, relayId, popup);
}

// ── Unified auth wait: postMessage + relay + visibility ─────────────────

function waitForAuth(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  relayId: string,
  popup: Window | null
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    let resolved = false;

    const finish = (result: { success: boolean; error?: string }, source: string) => {
      if (resolved) return;
      resolved = true;
      console.log("[oauth] resolved via", source, result);
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(relayPoll);
      clearInterval(popupPoll);
      clearTimeout(timeout);
      resolve(result);
    };

    const exchangeCode = async (code: string, source: string) => {
      console.log("[oauth] exchanging code from", source);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      finish(
        error ? { success: false, error: error.message } : { success: true },
        source
      );
    };

    // Channel 1: postMessage (works in desktop browsers)
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "oauth-callback") return;
      console.log("[oauth] received postMessage");
      if (event.data.code) exchangeCode(event.data.code, "postMessage");
      else finish({ success: false, error: "No auth code received" }, "postMessage-empty");
    };
    window.addEventListener("message", onMessage);

    // Channel 2: Relay polling (works on iOS PWA where overlay/Safari posts to relay)
    const checkRelay = async () => {
      if (resolved) return;
      try {
        const res = await fetch(`/api/auth/relay?id=${relayId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.code) {
          console.log("[oauth] relay returned code");
          exchangeCode(json.code, "relay");
        }
      } catch {
        /* transient error, keep trying */
      }
    };
    const relayPoll = setInterval(checkRelay, 2000);

    // Channel 3: Check on visibility change (user switches back to PWA)
    const onVisible = () => {
      if (document.visibilityState === "visible" && !resolved) {
        console.log("[oauth] app became visible, checking relay");
        checkRelay();
        setTimeout(checkRelay, 1500);
        setTimeout(checkRelay, 4000);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    // Detect popup closed (desktop browsers)
    const popupPoll = popup
      ? setInterval(() => {
          if (!popup.closed) return;
          clearInterval(popupPoll);
          console.log("[oauth] popup closed, final relay check");
          setTimeout(async () => {
            if (resolved) return;
            await checkRelay();
            if (!resolved)
              finish({ success: false, error: "Sign-in cancelled" }, "popup-closed");
          }, 1000);
        }, 500)
      : setInterval(() => {}, 999999); // no-op, cleared on finish

    // Give up after 5 minutes
    const timeout = setTimeout(() => {
      finish({ success: false, error: "Sign-in timed out" }, "timeout");
    }, 5 * 60 * 1000);
  });
}
