// ZELUX service worker. Required for Chrome's PWA installability criteria
// (a registered service worker, alongside a valid manifest, over HTTPS).
// Strategy: cache-first for the app shell/static assets (fast repeat loads,
// works offline for the shell), network-first for everything else (product
// data, API routes, checkout) so prices/stock/cart state are never served
// stale from cache - correctness matters more than speed for those.
//
// IMPORTANT: the homepage ('/') is cache-first, which means any browser/PWA
// that already cached it under an old CACHE_NAME will keep serving that
// stale HTML/JS indefinitely - even after a new deployment - until this
// version string changes. This was the actual root cause of a real bug:
// the site appeared fixed in incognito (no prior cache existed) but still
// showed old content on devices that had visited/installed it before this
// fix, since the service worker's activate handler only deletes caches
// that don't match the CURRENT CACHE_NAME - bumping it is what triggers
// that cleanup. Bump this version any time the cached APP_SHELL routes
// change in a way existing installs need to pick up immediately.
const CACHE_NAME = 'zelux-shell-v2';
const APP_SHELL = [
  '/',
  '/site.webmanifest',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept non-GET requests (POST checkout/API calls etc.) or
  // cross-origin requests (Stripe, fonts CDN) - let those pass through untouched.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // API routes and Next.js data requests: always go to the network first,
  // since cart/product/order data must never be served stale. Falling back
  // to cache only if the network is genuinely unreachable (offline).
  if (request.url.includes('/api/') || request.url.includes('/_next/data/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (pages, static assets, images): cache-first for speed,
  // falling back to network and caching the fresh response for next time.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    })
  );
});
