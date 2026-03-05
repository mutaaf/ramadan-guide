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

/** Detect if running as an installed PWA (standalone / fullscreen) */
function isPWAStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

/**
 * Sign in with OAuth using a popup (browser) or external browser (PWA).
 *
 * **Browser**: Opens a popup, callback sends the code via postMessage,
 * we exchange it here where the PKCE verifier lives.
 *
 * **iOS PWA**: `window.open()` opens Safari externally (returns null, no
 * popup reference, no postMessage, no shared localStorage). The callback
 * page in Safari relays the code to `/api/auth/relay` (Edge Runtime).
 * The PWA polls the relay when the user switches back.
 */
export async function signInWithPopup(
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const relayId = crypto.randomUUID();
  const inPWA = isPWAStandalone();

  // Get the OAuth URL (stores PKCE verifier in our localStorage)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?mode=popup&relay=${relayId}`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return { success: false, error: error?.message ?? "Failed to get OAuth URL" };
  }

  // Open the OAuth URL
  const popup = window.open(data.url, "oauth-popup");

  // On iOS PWA, window.open() opens Safari and returns null.
  // That's fine — we'll poll the relay when the user comes back.
  if (!popup && !inPWA) {
    return { success: false, error: "Popup blocked" };
  }

  if (inPWA) {
    return waitForRelay(supabase, relayId);
  }

  return waitForPopup(supabase, relayId, popup!);
}

// ── PWA flow: poll relay + visibilitychange ─────────────────────────────

function waitForRelay(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  relayId: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    let resolved = false;

    const finish = (result: { success: boolean; error?: string }) => {
      if (resolved) return;
      resolved = true;
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(poll);
      clearTimeout(timeout);
      resolve(result);
    };

    const checkRelay = async () => {
      if (resolved) return;
      try {
        const res = await fetch(`/api/auth/relay?id=${relayId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!json.code) return;

        const { error } = await supabase.auth.exchangeCodeForSession(json.code);
        finish(error ? { success: false, error: error.message } : { success: true });
      } catch {
        // transient network error, keep trying
      }
    };

    // Check aggressively when the user switches back to the PWA
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        // Check immediately and again after a short delay
        checkRelay();
        setTimeout(checkRelay, 1000);
        setTimeout(checkRelay, 3000);
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    // Also poll on an interval
    const poll = setInterval(checkRelay, 2500);

    // Give up after 5 minutes
    const timeout = setTimeout(() => {
      finish({ success: false, error: "Sign-in timed out" });
    }, 5 * 60 * 1000);
  });
}

// ── Browser flow: postMessage + relay fallback ──────────────────────────

function waitForPopup(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  relayId: string,
  popup: Window
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    let resolved = false;

    const finish = (result: { success: boolean; error?: string }) => {
      if (resolved) return;
      resolved = true;
      window.removeEventListener("message", onMessage);
      clearInterval(pollClosed);
      clearInterval(relayPoll);
      resolve(result);
    };

    const exchangeCode = async (code: string) => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      finish(error ? { success: false, error: error.message } : { success: true });
    };

    // Method 1: postMessage from popup
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "oauth-callback") return;
      if (event.data.code) exchangeCode(event.data.code);
      else finish({ success: false, error: "No auth code received" });
    };

    // Method 2: relay fallback
    const checkRelay = async () => {
      if (resolved) return;
      try {
        const res = await fetch(`/api/auth/relay?id=${relayId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.code) exchangeCode(json.code);
      } catch {
        // ignore
      }
    };

    // Detect popup closed → final check then give up
    const pollClosed = setInterval(() => {
      if (!popup.closed) return;
      clearInterval(pollClosed);
      setTimeout(async () => {
        if (resolved) return;
        await checkRelay();
        if (!resolved) finish({ success: false, error: "Sign-in cancelled" });
      }, 800);
    }, 500);

    const relayPoll = setInterval(checkRelay, 2500);

    window.addEventListener("message", onMessage);
  });
}
