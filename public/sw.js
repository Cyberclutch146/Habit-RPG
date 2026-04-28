/// <reference lib="webworker" />

const CACHE_NAME = 'habitquest-v1';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  (event as any).waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  (self as any).skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  (event as any).waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients immediately
  (self as any).clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = (event as any).request as Request;

  // Skip non-GET requests and API calls (they should always hit the network)
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  // Network-first strategy for pages, cache-first for static assets
  const url = new URL(request.url);
  const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|css|js)$/);

  if (isStaticAsset) {
    // Cache-first for static assets
    (event as any).respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  } else {
    // Network-first for HTML pages
    (event as any).respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline', { status: 503 });
          });
        })
    );
  }
});

// -- Push Notifications --
self.addEventListener('push', (event) => {
  const data = (event).data ? (event).data.json() : {};
  const title = data.title || 'HabitQuest';
  const options = {
    body: data.body || 'Time to complete your daily quests!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'habitquest-reminder',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
  };

  (event).waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
