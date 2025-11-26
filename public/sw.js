// Service Worker voor PakketAdvies PWA
// Versie: 1.0.0

const CACHE_NAME = 'pakketadvies-v1';
const RUNTIME_CACHE = 'pakketadvies-runtime-v1';

// Assets die direct gecached moeten worden
const STATIC_ASSETS = [
  '/',
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
        return cache.addAll(STATIC_ASSETS);
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

  // Skip API calls and external resources
  if (
    url.pathname.startsWith('/api/') ||
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

        return fetch(request)
          .then((response) => {
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
            // If network fails and no cache, return offline page
            if (request.destination === 'document') {
              return caches.match('/');
            }
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

