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
 * Sign in with OAuth via popup (browser) or server relay (PWA standalone).
 *
 * **Browser**: Opens a popup, gets the OAuth URL via `skipBrowserRedirect`,
 * the callback page sends the auth code back via `postMessage`, and we
 * exchange it here where the PKCE code_verifier lives.
 *
 * **PWA standalone**: `window.open()` opens the system browser which has no
 * `postMessage` channel back to the PWA. Instead, the callback page POSTs the
 * auth code to `/api/auth/relay`, and the PWA polls for it when the user
 * switches back.
 *
 * Must be called from a user-gesture (click handler) call stack so the
 * synchronous `window.open()` isn't blocked.
 */
export async function signInWithPopup(
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  if (isPWAStandalone()) {
    return signInWithRelay(supabase, provider);
  }
  return signInWithPopupWindow(supabase, provider);
}

// ── Browser popup flow ──────────────────────────────────────────────────

async function signInWithPopupWindow(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const popup = window.open(
    "about:blank",
    "oauth-popup",
    "width=500,height=600,left=200,top=100"
  );
  if (!popup) return { success: false, error: "Popup blocked" };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?mode=popup`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    popup.close();
    return { success: false, error: error?.message ?? "Failed to get OAuth URL" };
  }

  popup.location.href = data.url;

  return new Promise((resolve) => {
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearInterval(pollClosed);
    };

    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "oauth-callback") return;
      cleanup();

      const { code } = event.data;
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          resolve({ success: false, error: exchangeError.message });
        } else {
          resolve({ success: true });
        }
      } else {
        resolve({ success: false, error: "No auth code received" });
      }
    };

    const pollClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();
        resolve({ success: false, error: "Sign-in cancelled" });
      }
    }, 500);

    window.addEventListener("message", onMessage);
  });
}

// ── PWA relay flow ──────────────────────────────────────────────────────

async function signInWithRelay(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const relayId = crypto.randomUUID();

  // signInWithOAuth stores the PKCE code_verifier in *this* window's localStorage
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?mode=pwa&relay=${relayId}`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return { success: false, error: error?.message ?? "Failed to get OAuth URL" };
  }

  // Opens in the system browser (separate process from the PWA)
  window.open(data.url);

  // Poll for the auth code relayed by the callback page
  return new Promise((resolve) => {
    let resolved = false;

    const finish = (result: { success: boolean; error?: string }) => {
      if (resolved) return;
      resolved = true;
      clearInterval(pollInterval);
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisible);
      resolve(result);
    };

    const checkRelay = async () => {
      if (resolved) return;
      try {
        const res = await fetch(`/api/auth/relay?id=${relayId}`);
        if (!res.ok) return;
        const { code } = await res.json();
        if (!code) return;

        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        finish(
          exchangeError
            ? { success: false, error: exchangeError.message }
            : { success: true }
        );
      } catch {
        // Ignore transient network errors while polling
      }
    };

    // Check immediately when the user switches back to the PWA
    const onVisible = () => {
      if (document.visibilityState === "visible") checkRelay();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Also poll on an interval as a fallback
    const pollInterval = setInterval(checkRelay, 2000);

    // Give up after 5 minutes
    const timeout = setTimeout(() => {
      finish({ success: false, error: "Sign-in timed out" });
    }, 5 * 60 * 1000);
  });
}
