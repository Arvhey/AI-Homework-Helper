const CACHE_NAME = 'ai-helper-v15';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Force the waiting service worker to become active immediately
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old Service Worker Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Claim clients immediately
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests to avoid Cache API method restrictions (e.g., HEAD, POST)
  if (event.request.method !== 'GET') return;

  // Only intercept HTTP/HTTPS schemes (bypasses chrome-extension://, etc.)
  if (!event.request.url.startsWith('http')) return;

  // Network-First with Cache Fallback strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If response is valid, update the cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network offline/failed, load from cache
        return caches.match(event.request);
      })
  );
});

// Handle Background Push Notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "Time to crush your study goals!",
      icon: "/logo.png",
      badge: "/logo.png",
      vibrate: [500, 250, 500, 250, 500],
      requireInteraction: true,
      data: {
        url: data.url || "/"
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "⏰ DAILY STUDY ALARM! 🚨", options)
    );
  }
});

// Handle Notification Clicks (opens the app)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // If the app is already open, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
