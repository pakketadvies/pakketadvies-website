// Service Worker voor PakketAdvies PWA
// Versie: 2.1.0 - Force cache invalidation voor nieuwe deployment

const CACHE_NAME = 'pakketadvies-v5';
const RUNTIME_CACHE = 'pakketadvies-runtime-v5';

// Assets die direct gecached moeten worden (alleen statische assets)
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
        return Promise.all(
          STATIC_ASSETS.map((url) => {
            return fetch(url, { redirect: 'follow' })
              .then((response) => {
                if (response.ok && !response.redirected) {
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

// Fetch event - BYPASS ALL NAVIGATIONS, only cache static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // CRITICAL: BYPASS ALL NAVIGATIONS/DOCUMENTS
  // This prevents Safari redirect errors and ensures cookie-based redirects work correctly.
  // Navigations always go directly to the server, never through the service worker.
  if (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    // Let the browser handle navigation requests directly (bypass SW)
    return;
  }

  // Skip API calls and Next.js internal routes
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('/_next/') || // Extra check voor Next.js chunks
    url.pathname.match(/\.[a-f0-9]{16}\.js$/) || // Next.js hashed JS files
    url.hostname !== self.location.hostname ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // Only cache static assets (images, fonts, CSS, JS, etc.)
  // Strategy: Cache First, then Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(url.href, { redirect: 'follow', credentials: 'include' })
          .then((response) => {
            // Never cache redirects
            if (response.redirected) {
              return response;
            }

            // Only cache successful, non-redirected, basic responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Only cache static assets (images, fonts, CSS) - NEVER cache JS files
            const contentType = response.headers.get('content-type') || '';
            const isStaticAsset = 
              contentType.startsWith('image/') ||
              contentType.startsWith('font/') ||
              contentType.includes('font/') ||
              contentType.startsWith('text/css') ||
              url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css)$/i);
            
            // NEVER cache JavaScript files to prevent hydration errors
            const isJavaScript = 
              contentType.startsWith('application/javascript') ||
              contentType.startsWith('text/javascript') ||
              url.pathname.match(/\.js$/i);

            if (isStaticAsset && !isJavaScript) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // If network fails and no cache, return error
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

