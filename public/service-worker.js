const CACHE_NAME = 'prescrevame-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/f9d8ee9c-efab-4f5c-98b5-b08a1a131d86.png',
  '/?source=pwa'
];

// Install event - cache app shell and static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell and content');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Error during pre-cache:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  // Claim clients so that the updates are visible immediately
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - respond with cache, then network
self.addEventListener('fetch', (event) => {
  // Handle images specially
  if (event.request.url.includes('/lovable-uploads/') || event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response for the browser and cache
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(() => {
              // Return a fallback image if fetch fails
              console.log('Service Worker: Failed to fetch image');
              return new Response('', {status: 404});
            });
        })
    );
    return;
  }
  
  // Cache first, then network strategy for other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return from cache if found
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network
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
      .catch((error) => {
        console.log('Service Worker: Fetch error:', error);
        
        // Fallback for HTML pages
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
