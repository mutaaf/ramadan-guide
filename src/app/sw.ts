/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Exclude auth-related requests from service worker cache (network-only).
// This covers: OAuth callbacks, Supabase API calls, and token endpoints.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  const isAuthRelated =
    url.pathname.startsWith("/auth/") ||
    url.pathname.includes("/callback") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("accounts.google.com") ||
    url.hostname.includes("appleid.apple.com") ||
    url.searchParams.has("code");

  if (isAuthRelated) {
    event.respondWith(fetch(event.request));
  }
});

// Handle notification clicks — focus existing window or open new one
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          client.postMessage({ type: "NOTIFICATION_CLICK", url: targetUrl });
          return;
        }
      }
      // No existing window — open a new one
      return self.clients.openWindow(targetUrl);
    })
  );
});
