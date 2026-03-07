/**
 * Temporary auth-code relay for PWA OAuth flow.
 *
 * On iOS, the in-app Safari sheet opened via window.open() from a PWA does NOT
 * share localStorage with the PWA. The PKCE code_verifier lives in the PWA's
 * localStorage, so the callback page can't exchange the code.
 *
 * Flow:
 *  1. PWA generates relay ID, opens OAuth URL with ?relay=RELAY_ID
 *  2. Callback page (in-app sheet) POSTs the auth code here
 *  3. PWA polls here, receives the code, exchanges it locally (has PKCE verifier)
 *
 * Uses Edge Runtime for persistent in-memory state across requests.
 */

export const runtime = "edge";

const store = new Map<string, { code: string; expires: number }>();

const TTL = 5 * 60 * 1000; // 5 minutes

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expires) store.delete(key);
  }
}

export async function POST(request: Request) {
  try {
    const { id, code } = await request.json();
    if (!id || !code) {
      return Response.json({ error: "Missing id or code" }, { status: 400 });
    }
    cleanup();
    store.set(id, { code, expires: Date.now() + TTL });
    console.log("[oauth:relay] stored code for", id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }
  cleanup();
  const entry = store.get(id);
  if (!entry || Date.now() > entry.expires) {
    console.log("[oauth:relay] no code for", id);
    return Response.json({ code: null });
  }
  store.delete(id); // one-time retrieval
  console.log("[oauth:relay] returned code for", id);
  return Response.json({ code: entry.code });
}
