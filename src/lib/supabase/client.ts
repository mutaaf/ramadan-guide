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
 * Sign in with OAuth using a popup window.
 * Works in PWA standalone mode (avoids PKCE code_verifier being lost in a different browser context)
 * and is less disruptive than a full-page redirect in regular browser mode.
 *
 * Must be called from a user-gesture (click handler) call stack so the synchronous
 * window.open() isn't blocked by the browser's popup blocker.
 */
export async function signInWithPopup(
  provider: "google" | "apple"
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  // Open popup synchronously — must be in click handler call stack to avoid blockers
  const popup = window.open(
    "about:blank",
    "oauth-popup",
    "width=500,height=600,left=200,top=100"
  );
  if (!popup) return { success: false, error: "Popup blocked" };

  // Get the OAuth URL without redirecting the current page
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

  // Navigate popup to OAuth URL
  popup.location.href = data.url;

  // Wait for the popup to send back the session via postMessage
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

    // Poll for popup being closed without completing auth
    const pollClosed = setInterval(() => {
      if (popup.closed) {
        cleanup();
        resolve({ success: false, error: "Sign-in cancelled" });
      }
    }, 500);

    window.addEventListener("message", onMessage);
  });
}
