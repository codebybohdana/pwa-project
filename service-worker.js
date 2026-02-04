/**
 * City Assistant PWA — Service Worker
 * Goals:
 * - Precache app shell (fast start, good Lighthouse)
 * - Offline fallback for documents (offline.html)
 * - Sensible runtime caching strategies
 */

const CACHE_VERSION = "v1";
const APP_CACHE = `city-assistant-app-${CACHE_VERSION}`;
const RUNTIME_CACHE = `city-assistant-runtime-${CACHE_VERSION}`;
const IMAGES_CACHE = `city-assistant-images-${CACHE_VERSION}`;

// Base path (works for root and subfolders; Netlify will be "/")
const getBasePath = () => {
  const basePath = self.location.pathname.replace("/service-worker.js", "");
  return basePath || "/";
};
const basePath = getBasePath();

const OFFLINE_URL = `${basePath}pages/offline.html`;

// Precache (app shell)
const PRECACHE_ASSETS = [
  `${basePath}`,
  `${basePath}index.html`,
  `${basePath}pages/add-place.html`,
  `${basePath}pages/place-details.html`,
  `${basePath}pages/edit-place.html`,
  OFFLINE_URL,

  `${basePath}css/styles.css`,

  `${basePath}js/app.js`,
  `${basePath}js/db.js`,
  `${basePath}js/image-cache.js`,
  `${basePath}js/camera.js`,
  `${basePath}js/geolocation.js`,
  `${basePath}js/utils.js`,

  `${basePath}js/views/index.js`,
  `${basePath}js/views/add-place.js`,
  `${basePath}js/views/place-details.js`,
  `${basePath}js/views/edit-place.js`,

  `${basePath}manifest.webmanifest`,

  `${basePath}images/placeholder.png`,
  `${basePath}images/icons/icon-72.png`,
  `${basePath}images/icons/icon-96.png`,
  `${basePath}images/icons/icon-144.png`,
  `${basePath}images/icons/icon-192.png`,
  `${basePath}images/icons/icon-384.png`,
  `${basePath}images/icons/icon-512.png`,
  `${basePath}images/icons/icon-192-maskable.png`,
  `${basePath}images/icons/icon-512-maskable.png`,
];

// -------- helpers --------

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  return cached || (await fetchPromise);
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    return cached;
  }
}

function isHtmlRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isStaticAsset(url) {
  return (
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  );
}

// -------- install / activate --------

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_CACHE);
      await cache.addAll(PRECACHE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          const keep = [APP_CACHE, RUNTIME_CACHE, IMAGES_CACHE].includes(key);
          const isOurOld = key.startsWith("city-assistant-") && !keep;
          if (isOurOld) return caches.delete(key);
        })
      );
      await self.clients.claim();
    })()
  );
});

// -------- fetch --------

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET http(s)
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!url.protocol.startsWith("http")) return;

  // Only handle same-origin for caching (avoid caching 3rd party)
  const sameOrigin = url.origin === self.location.origin;

  // 1) HTML navigation: Network First, fallback to cache, then offline page
  if (sameOrigin && isHtmlRequest(request)) {
    event.respondWith(
      (async () => {
        const res = await networkFirst(request, APP_CACHE);
        if (res) return res;

        // fallback offline page
        const cache = await caches.open(APP_CACHE);
        const offline = await cache.match(OFFLINE_URL);
        return offline || new Response("Offline", { status: 503 });
      })()
    );
    return;
  }

  // 2) Static assets (css/js/icons/etc): Stale-While-Revalidate (fast + updates)
  if (sameOrigin && isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // 3) Other same-origin requests:
  // - images: cache-first (speed)
  // - anything else: network-first
  if (sameOrigin && request.destination === "image") {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  if (sameOrigin) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
  }
});
