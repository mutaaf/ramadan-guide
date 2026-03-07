import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip internal relay calls to prevent recursion
  if (request.headers.get("x-relay-internal") === "1") {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  // Server-side relay: when OAuth callback arrives with relay params,
  // store the auth code in the relay BEFORE the page even loads.
  // This runs on the server so it can't be killed by window.close().
  if (pathname === "/auth/callback") {
    const code = searchParams.get("code");
    const relay = searchParams.get("relay");
    const mode = searchParams.get("mode");

    if (mode === "popup" && relay && code) {
      console.log("[oauth:middleware] relaying code for", relay);
      try {
        await fetch(new URL("/api/auth/relay", request.url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-relay-internal": "1",
          },
          body: JSON.stringify({ id: relay, code }),
        });
        console.log("[oauth:middleware] relay POST succeeded");
      } catch (e) {
        console.warn("[oauth:middleware] relay POST failed", e);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon-.*|manifest\\.json|sw\\.js|swe-worker-.*).*)",
  ],
};
