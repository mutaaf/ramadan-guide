import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip internal relay calls to prevent recursion
  if (request.headers.get("x-relay-internal") === "1") {
    return NextResponse.next();
  }

  // Redirect all traffic to canonical domain in production
  const host = request.headers.get("host") || "";
  const canonicalDomain = "www.myramadanguide.com";

  if (
    host !== canonicalDomain &&
    !host.startsWith("localhost") &&
    !host.startsWith("127.0.0.1") &&
    process.env.NODE_ENV === "production"
  ) {
    const url = request.nextUrl.clone();
    url.host = canonicalDomain;
    url.port = "";
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
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
