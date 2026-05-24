const CACHE_NAME = 'ai-helper-v13';
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
