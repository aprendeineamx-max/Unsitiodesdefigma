// Service Worker for PWA functionality

const CACHE_NAME = 'platzi-v2-2025'; // ✅ ACTUALIZADO: nuevo nombre de caché para 2025
const urlsToCache = [
  '/',
  '/manifest.json',
  // ✅ REMOVIDO: archivos estáticos que causan problemas (Vite los maneja automáticamente)
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network First strategy
self.addEventListener('fetch', (event) => {
  // ✅ NUEVO: Ignorar peticiones de desarrollo de Vite (HMR, CSS modules, etc.)
  const url = new URL(event.request.url);
  
  // Skip caching for Vite dev server resources and dynamic imports
  if (
    url.pathname.includes('/@') || // Vite internals
    url.pathname.includes('?') ||  // Query params (HMR, timestamps)
    url.pathname.endsWith('.css') || // CSS files (Vite handles them)
    url.pathname.includes('/node_modules/') || // Dependencies
    url.pathname.includes('/__') // Vite special routes
  ) {
    // Just fetch without caching
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseClone = response.clone();
        
        // Store in cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Return offline page if available
            return caches.match('/offline.html');
          });
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync pending analytics events
  console.log('Syncing analytics...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.message || 'Nueva notificación de Platzi',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Platzi', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});