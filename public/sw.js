/**
 * BILENS BOOTH — Service Worker
 *
 * Strategy: Network-first with cache fallback.
 * Caches successful responses for offline support.
 * Falls back to cached index.html for navigation requests (SPA).
 */

const CACHE_NAME = 'bilens-booth-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        // Network failed — try cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        // SPA fallback: serve cached index for navigation requests
        if (event.request.mode === 'navigate') {
          const cachedIndex = await cache.match('/');
          if (cachedIndex) return cachedIndex;
        }

        return new Response('Offline — no cached version available', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      }
    })()
  );
});
