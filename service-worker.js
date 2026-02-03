/**
 * SERVICE WORKER
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `city-assistant-${CACHE_VERSION}`;

const APP_ASSETS = [
  "/",
  "/index.html",
  "/pages/add-place.html",
  "/pages/place-details.html",
  "/pages/edit-place.html",
  "/pages/offline.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/db.js",
  "/js/camera.js",
  "/js/geolocation.js",
  "/js/utils.js",
  "/js/views/index.js",
  "/js/views/add-place.js",
  "/js/views/place-details.js",
  "/js/views/edit-place.js",
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

// Install
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching assets");
        return cache.addAll(APP_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.destination === "document") {
            return caches.match("/pages/offline.html");
          }
        });
      })
  );
});

console.log("[SW] Script loaded");
