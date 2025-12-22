// Service Worker voor PakketAdvies PWA
// Versie: 1.0.0

// Bump cache version to invalidate older buggy caches (especially cached "/")
const CACHE_NAME = 'pakketadvies-v3';
const RUNTIME_CACHE = 'pakketadvies-runtime-v3';

// Assets die direct gecached moeten worden
const STATIC_ASSETS = [
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-icon.png',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        // Use Promise.all with individual fetch calls to handle redirects properly
        return Promise.all(
          STATIC_ASSETS.map((url) => {
            return fetch(url, { redirect: 'follow' })
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((error) => {
                console.warn('[Service Worker] Failed to cache:', url, error);
              });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // NEVER intercept "/" (root) because it is cookie-dependent ("/" -> "/particulier") and redirects can break SW fetch if request.redirect isn't "follow".
  // This prevents "redirected response was used for a request whose redirect mode is not 'follow'".
  if (url.pathname === '/' && !url.search) {
    event.respondWith(
      fetch(url.href, { redirect: 'follow', credentials: 'include' }).catch(() => {
        return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      })
    )
    return;
  }

  // Never cache navigations/documents.
  // Our app uses cookie-based redirects, so caching HTML can trap users in the wrong experience.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(url.href, { redirect: 'follow', credentials: 'include' }).catch(() => {
        return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      })
    )
    return;
  }

  // Skip API calls and external resources
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.hostname !== self.location.hostname ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // Strategy: Cache First, then Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(url.href, { redirect: 'follow', credentials: 'include' })
          .then((response) => {
            // Handle redirects - don't cache redirect responses
            if (response.redirected) {
              // If redirected, return the final response but don't cache the redirect
              return response;
            }

            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            return new Response('Network error', { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
          });
      })
  );
});

// Background sync (voor toekomstige functionaliteit)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  // Kan gebruikt worden voor offline form submissions
});

// Push notifications (voor toekomstige functionaliteit)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  // Kan gebruikt worden voor contract updates
});

