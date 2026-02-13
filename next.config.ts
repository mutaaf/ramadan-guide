import type { NextConfig } from "next";
import crypto from "crypto";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  // Use webpack for builds since Serwist doesn't fully support Turbopack yet
  turbopack: {},
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_HASH:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
      crypto.randomBytes(4).toString("hex"),
  },
};

export default withSerwist(nextConfig);
