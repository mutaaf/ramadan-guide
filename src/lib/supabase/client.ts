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
 * Sign in with OAuth using a popup / in-app sheet.
 *
 * Opens a popup synchronously (avoids popup blockers), navigates to the OAuth
 * URL, then waits for the auth code via three parallel methods:
 *
 *  1. **postMessage** — works in desktop/Android browser popups where
 *     `window.opener` is available.
 *
 *  2. **Server relay** — the callback page POSTs the code to `/api/auth/relay`,
 *     and we poll it here. Works in iOS PWA where the in-app Safari sheet has
 *     NO `window.opener` and does NOT share localStorage.
 *
 *  3. **Session check** — if localStorage IS shared (some platforms), the
 *     callback page may exchange the code there and the session appears here.
 *
 * The PKCE code_verifier stays in this window's localStorage, so the code
 * exchange always happens here (not in the popup/sheet).
 */
export async function signInWithPopup(
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const relayId = crypto.randomUUID();

  // Get the OAuth URL first (stores PKCE verifier in our localStorage)
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

  // Open the OAuth URL directly — on iOS PWA, setting popup.location.href
  // on an about:blank sheet doesn't work, so we must open the final URL.
  // iOS may show a confirmation dialog since this is after an await.
  const popup = window.open(data.url, "oauth-popup");
  if (!popup) return { success: false, error: "Popup blocked" };

  return new Promise((resolve) => {
    let resolved = false;

    const finish = (result: { success: boolean; error?: string }) => {
      if (resolved) return;
      resolved = true;
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(pollClosed);
      clearInterval(relayPoll);
      clearInterval(sessionPoll);
      resolve(result);
    };

    const exchangeCode = async (code: string) => {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      finish(
        exchangeError
          ? { success: false, error: exchangeError.message }
          : { success: true }
      );
    };

    // ── Method 1: postMessage (browser popup with window.opener) ──────
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "oauth-callback") return;
      if (event.data.code) exchangeCode(event.data.code);
      else finish({ success: false, error: "No auth code received" });
    };

    // ── Method 2: Server relay (PWA in-app sheet → server → here) ─────
    const checkRelay = async () => {
      if (resolved) return;
      try {
        const res = await fetch(`/api/auth/relay?id=${relayId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.code) exchangeCode(data.code);
      } catch {
        // ignore transient errors
      }
    };

    // ── Method 3: Session check (if localStorage is shared) ───────────
    const checkSession = async () => {
      if (resolved) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) finish({ success: true });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        checkRelay();
        checkSession();
      }
    };

    // Poll for popup/sheet being closed
    const pollClosed = setInterval(() => {
      if (!popup.closed) return;
      clearInterval(pollClosed);
      // Final check after a brief delay (session may still be propagating)
      setTimeout(async () => {
        if (resolved) return;
        await checkRelay();
        if (resolved) return;
        await checkSession();
        if (!resolved) finish({ success: false, error: "Sign-in cancelled" });
      }, 800);
    }, 500);

    // Poll relay and session periodically
    const relayPoll = setInterval(checkRelay, 2000);
    const sessionPoll = setInterval(checkSession, 2000);

    window.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", onVisible);
  });
}
