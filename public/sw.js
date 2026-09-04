// Elite Academy LMS - Progressive Web App Service Worker
const CACHE_NAME = 'elite-academy-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// 1. Install event: Pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate event: Clean up obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch event: Stale-while-revalidate for assets, Network-first for pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET and API/auth routes
  if (request.method !== 'GET' || url.pathname.startsWith('/api') || url.pathname.startsWith('/_next/webpack-hmr')) {
    return;
  }

  // Static files and images: Cache-first
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // HTML Navigation requests: Network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((res) => res || caches.match('/')))
    );
    return;
  }
});

// 4. Web Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'أكاديمية إيليت — تنبيه هام 🌟';
  const options = {
    body: data.body || 'محاضرة جديدة أو واجب بانتظارك يا بطل!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/portal/dashboard',
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/portal/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
