const CACHE_VERSION = "v3.0.0";
const CACHE_NAME = "rinbow-aqua-" + CACHE_VERSION;
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/offline.html",
  "/manifest.json",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install — cache only true static assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    )
  );
});

// Activate — delete ALL old caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Helper — is this a Next.js RSC / internal request we must never cache?
function shouldSkip(url) {
  const p = url.pathname;
  const s = url.search;

  // RSC payload requests
  if (s.includes("_rsc=")) return true;
  // Next.js RSC .txt files
  if (p.includes("__next") && p.endsWith(".txt")) return true;
  // Next.js internal chunks (handled by browser cache headers)
  if (p.startsWith("/_next/")) return true;
  // Cross-origin
  if (url.origin !== self.location.origin) return true;
  // Non-GET (handled upstream)
  return false;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (shouldSkip(url)) return;

  // Navigation — network first, cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static file extensions — cache first, network fallback
  if (/\.(?:css|js|png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
          }
          return res;
        }).catch(() => new Response("", { status: 503 }));
      })
    );
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Rainbow Aqua", {
      body: data.body || "New update from Rainbow Aqua!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
