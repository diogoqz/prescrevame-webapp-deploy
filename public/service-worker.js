
const CACHE_NAME = 'prescrevame-cache-v2'; // Incremented version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Image may be accessible through a different path in production
  '/lovable-uploads/f9d8ee9c-efab-4f5c-98b5-b08a1a131d86.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Pre-caching failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response from cache
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for the browser and cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, you could return a fallback
        if (event.request.url.indexOf('/lovable-uploads/') !== -1) {
          // Return a fallback for images
          return new Response('', {status: 404});
        }
      })
  );
});

// Clear old caches when a new service worker is activated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
