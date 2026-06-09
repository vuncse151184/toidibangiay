const CACHE_VERSION = 'v1';
const IMAGE_CACHE = `toidibangiay-images-${CACHE_VERSION}`;
const API_CACHE = `toidibangiay-api-${CACHE_VERSION}`;

const IMAGE_HOSTS = ['res.cloudinary.com', 'static.nike.com'];
const API_PATHS = ['/api/products', '/api/collections'];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== IMAGE_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CacheFirst for product images from CDN
  if (IMAGE_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // NetworkFirst for Next.js API routes
  if (API_PATHS.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }
});

async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
