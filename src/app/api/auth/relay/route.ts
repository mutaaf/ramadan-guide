import { NextResponse, type NextRequest } from "next/server";

/**
 * Temporary in-memory relay for PWA OAuth flow.
 *
 * In PWA standalone mode, window.open() opens the system browser which has
 * no postMessage channel back to the PWA. Instead the callback page POSTs the
 * auth code here, and the PWA polls for it.
 *
 * Codes auto-expire after 5 minutes and are deleted on first retrieval.
 */

const store = new Map<string, { code: string; expires: number }>();

const TTL = 5 * 60 * 1000; // 5 minutes

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expires) store.delete(key);
  }
}

// POST: store an auth code for a relay ID
export async function POST(request: NextRequest) {
  try {
    const { id, code } = await request.json();
    if (!id || !code) {
      return NextResponse.json({ error: "Missing id or code" }, { status: 400 });
    }

    cleanup();
    store.set(id, { code, expires: Date.now() + TTL });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// GET: retrieve (and delete) the auth code for a relay ID
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  cleanup();
  const entry = store.get(id);
  if (!entry || Date.now() > entry.expires) {
    return NextResponse.json({ code: null });
  }

  store.delete(id);
  return NextResponse.json({ code: entry.code });
}
