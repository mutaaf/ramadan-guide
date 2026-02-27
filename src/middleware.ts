import { NextResponse } from "next/server";

export async function middleware() {
  // Auth sessions are stored in localStorage (client-side), not cookies.
  // Middleware can't refresh localStorage tokens — the Supabase JS client
  // handles auto-refresh via autoRefreshToken: true.
  // This middleware is kept as a pass-through for future server-side needs.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon-.*|manifest\\.json|sw\\.js|swe-worker-.*).*)",
  ],
};
