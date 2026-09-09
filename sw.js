/* ================================================================
   Trilion Thunders Company Service Worker (sw.js)
   Enables 100% full offline usage with Network-First code updates
================================================================ */

const CACHE_NAME = 'trilion-thunders-cache-v11';

// Core assets to pre-cache immediately upon install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './libs/html2pdf.bundle.min.js',
  './libs/supabase.js',
  './env.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg',
  './login_showcase.jpg'
];

// Install Event: pre-cache all core files and skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate Event: clear old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Network-First for app code, Stale-While-Revalidate for fonts/assets
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Ignore non-http requests
  if (!url.protocol.startsWith('http')) return;

  // For Google Fonts or external CDNs: Stale-While-Revalidate
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(req);
        const fetchPromise = fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(req, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Network-First for HTML, JS, CSS and navigation so user ALWAYS gets latest updates
  const isAppCode = req.mode === 'navigate' || 
                    url.pathname.endsWith('.html') || 
                    url.pathname.endsWith('.js') || 
                    url.pathname.endsWith('.css') || 
                    url.pathname.endsWith('.json') ||
                    url.pathname === '/';

  if (isAppCode) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            if (cached) return cached;
            if (req.mode === 'navigate') {
              return caches.match('./index.html') || caches.match('./');
            }
          });
        })
    );
    return;
  }

  // For static media (images, icons): Cache-First with background revalidation
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
