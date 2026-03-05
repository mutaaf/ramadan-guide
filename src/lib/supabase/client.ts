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
 * Opens a popup synchronously (must be in click-handler call stack to avoid
 * blockers), gets the OAuth URL via `skipBrowserRedirect`, and navigates the
 * popup to it. The callback page handles the rest:
 *
 * - **Browser popup** (`window.opener` exists): sends the auth code back via
 *   `postMessage`, and we exchange it here (where the PKCE verifier lives).
 *
 * - **PWA in-app sheet** (`window.opener` is null): the callback page exchanges
 *   the code directly (the in-app sheet shares localStorage with the PWA), then
 *   shows "Sign-in complete". We detect the new session via polling +
 *   visibilitychange when the user returns.
 */
export async function signInWithPopup(
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  // Open popup synchronously — must be in click handler call stack
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
    let resolved = false;

    const finish = (result: { success: boolean; error?: string }) => {
      if (resolved) return;
      resolved = true;
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(pollClosed);
      clearInterval(sessionPoll);
      resolve(result);
    };

    // ── Method 1: postMessage from popup (works in browser) ───────────
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "oauth-callback") return;

      const { code } = event.data;
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        finish(
          exchangeError
            ? { success: false, error: exchangeError.message }
            : { success: true }
        );
      } else {
        finish({ success: false, error: "No auth code received" });
      }
    };

    // ── Method 2: session check (works in PWA where in-app sheet
    //    shares localStorage — the callback page exchanges the code
    //    there and the session appears in our localStorage) ────────────
    const checkSession = async () => {
      if (resolved) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) finish({ success: true });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") checkSession();
    };

    // Poll for popup/sheet being closed
    const pollClosed = setInterval(() => {
      if (!popup.closed) return;
      clearInterval(pollClosed);
      // Give a moment for localStorage to sync before declaring cancel
      setTimeout(async () => {
        if (resolved) return;
        await checkSession();
        if (!resolved) finish({ success: false, error: "Sign-in cancelled" });
      }, 600);
    }, 500);

    // Periodic session poll as extra fallback
    const sessionPoll = setInterval(checkSession, 2000);

    window.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", onVisible);
  });
}
