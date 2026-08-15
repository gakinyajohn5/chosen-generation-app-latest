/* ════════════════════════════════════════════════════════
   CHOSEN GEN HUB — Service Worker
   Caches the app shell so the app installs as a PWA and
   opens instantly / works offline. API calls (/api/...) are
   NEVER cached — they always hit the network, since they
   involve payments, live data, and admin actions.
════════════════════════════════════════════════════════ */

const CACHE_NAME = 'chosen-gen-hub-v2';

const APP_SHELL = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

// Large, rarely-changing data files: cached the first time they're fetched
// (cache-first, same as other static assets below) rather than pre-cached on
// install, so a first-time visitor isn't forced to download 3+MB up front.
// bible-sw.json (full Swahili Bible) falls into this bucket automatically.

/* ── Install: pre-cache the app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean up old cache versions ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first for app shell, network-only for everything dynamic ── */
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API calls (chat, mpesa, members, docs, downloads) —
  // these must always be fresh and are same-origin but dynamic.
  if (url.pathname.startsWith('/api/')) {
    return; // let the browser handle it normally (network)
  }

  // Let cross-origin requests (YouTube, Jitsi, fonts, Open Library, etc.) pass through untouched
  if (url.origin !== self.location.origin) {
    return;
  }

  // Cache-first strategy for same-origin static assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          // Only cache successful, basic (same-origin) responses
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve the shell for navigations
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
