// 9mm Load Dev - Service Worker for Competitive Shooters
// Provides offline capability for the static tool

const CACHE_NAME = '9mm-pf-v1.0.0';
const ASSETS = [
  './index.html',
  './manifest.json'
  // Note: Tailwind CDN and Font Awesome are external. They will work when online.
  // For true offline, a future version can self-host critical CSS/JS.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-first for our own files
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // For external resources (Tailwind CDN, icons), try network first, then cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
