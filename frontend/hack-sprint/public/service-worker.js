// Bump this on any change to the caching strategy itself (not on every
// deploy — build assets are already content-hashed by Vite, so they don't
// need a cache-version bump to be picked up).
const CACHE_NAME = "hacksprint-cache-v2";
const APP_SHELL = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever cache same-origin GETs. This is a single-origin SPA that
  // talks to a separate API gateway origin — letting cross-origin API
  // calls fall straight through to the network avoids ever accidentally
  // serving stale/cached API responses.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  const isNavigation = request.mode === "navigate";

  if (isNavigation) {
    // Network-first for the app shell: an SPA rebuild changes index.html's
    // references to hashed asset filenames, so a cached index.html could
    // point at JS/CSS files that no longer exist on the server. Only fall
    // back to cache when actually offline.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/index.html")))
    );
    return;
  }

  // Cache-first for everything else same-origin (hashed /assets/*, icons,
  // manifest) — these are either content-hashed or effectively static, so
  // stale-forever is the correct, cheapest strategy.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
