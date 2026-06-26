// ZELUX service worker. Required for Chrome's PWA installability criteria
// (a registered service worker, alongside a valid manifest, over HTTPS).
//
// Strategy (corrected - see the fetch handler below for the full history of
// why this changed): page navigations (HTML documents) are NETWORK-FIRST,
// not cache-first. Content-hashed static assets (/_next/static/* JS/CSS,
// images) are cache-first, since their filename changes whenever their
// content does, making them safe to cache forever. API routes are
// network-first with an offline fallback. Getting the HTML strategy wrong
// (cache-first) was a real, confirmed bug: stale cached HTML referenced JS
// chunk filenames from a previous deploy that the server had already
// deleted, causing chunk 404s that manifested as a stuck loading spinner or
// a broken page - sometimes "fixed" by a refresh, sometimes not, depending
// on whether that refresh happened to bypass the stale cache entry.
const CACHE_NAME = 'zelux-shell-v3';
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

  // PAGE NAVIGATIONS (HTML documents - the actual page you land on, like
  // /, /profile, /cart) MUST be network-first, never cache-first. This was
  // a real bug fixed here, not a hypothetical: Next.js gives every build a
  // new BUILD_ID, and every page's HTML references JS chunk filenames tied
  // to that BUILD_ID. A cache-first HTML response served stale page markup
  // pointing at chunk files the server had already deleted after the next
  // deploy - causing 404s on those chunks, which surfaced as the page
  // hanging on a loading spinner or showing errors, sometimes "fixed" by a
  // refresh (which luckily re-hit the network) and sometimes not (if that
  // refresh also got served the same stale cache entry again).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Everything else here is a content-hashed static asset (/_next/static/...
  // JS/CSS chunks, images) - safe to cache-first forever, since the filename
  // itself changes whenever the content does. A stale cache entry for one of
  // these is simply never reused, because a new build requests a different
  // URL entirely - there's no equivalent risk to the HTML case above.
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
