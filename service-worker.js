/**
 * service-worker.js
 * Офлайн режим + кешування.
 * Стратегії:
 * - HTML: network-first (свіжі сторінки)
 * - CSS/JS/Images: cache-first + background update
 */

const CACHE_VERSION = "v3"; // міняй при релізах
const CACHE_NAME = `city-assistant-${CACHE_VERSION}`;

const APP_ASSETS = [
  "/",
  "/index.html",
  "/pages/add-place.html",
  "/pages/edit-place.html",
  "/pages/place-details.html",
  "/pages/offline.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/utils.js",
  "/js/db.js",
  "/js/camera.js",
  "/js/geolocation.js",
  "/js/views/index.js",
  "/js/views/add-place.js",
  "/js/views/edit-place.js",
  "/js/views/place-details.js",
  "/manifest.webmanifest",
  "/images/placeholder.png",
  "/images/icons/icon-72.png",
  "/images/icons/icon-96.png",
  "/images/icons/icon-144.png",
  "/images/icons/icon-192.png",
  "/images/icons/icon-384.png",
  "/images/icons/icon-512.png",
  "/images/icons/icon-192-maskable.png",
  "/images/icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // тільки http/https
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(handleRequest(req));
});

async function handleRequest(req) {
  const url = new URL(req.url);

  try {
    // HTML: network-first
    if (req.destination === "document" || url.pathname.endsWith(".html")) {
      return await networkFirst(req);
    }

    // CSS/JS/Images: cache-first + background update
    if (
      req.destination === "style" ||
      req.destination === "script" ||
      req.destination === "image" ||
      url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg)$/)
    ) {
      return await cacheFirst(req);
    }

    // інше: network-first
    return await networkFirst(req);
  } catch (e) {
    // fallback: offline page
    if (req.destination === "document") {
      const cache = await caches.open(CACHE_NAME);
      return cache.match("/pages/offline.html");
    }
    throw e;
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw new Error("Network failed");
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) {
    // background update
    fetch(req)
      .then((res) => res && res.ok && cache.put(req, res.clone()))
      .catch(() => {});
    return cached;
  }
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
