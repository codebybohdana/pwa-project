/**
 * ========================================
 * SERVICE WORKER
 * ========================================
 * Provides offline functionality and caching
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `city-assistant-${CACHE_VERSION}`;

// Files to cache
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
  "/js/edit.js",
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

// ========================================
// INSTALL EVENT
// ========================================
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        return cache.addAll(APP_ASSETS);
      })
      .then(() => {
        console.log("[Service Worker] Installed successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[Service Worker] Installation failed:", error);
      })
  );
});

// ========================================
// ACTIVATE EVENT
// ========================================
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[Service Worker] Activated");
        return self.clients.claim();
      })
  );
});

// ========================================
// FETCH EVENT (Caching strategies)
// ========================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore chrome-extension and other protocols
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Ignore browser-sync and hot reload
  if (url.hostname === "localhost" && url.port === "3001") {
    return;
  }

  event.respondWith(handleFetch(request));
});

/**
 * Handle fetch request
 * @param {Request} request - HTTP request
 * @returns {Promise<Response>}
 */
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // Strategy 1: HTML - Network First (always fresh)
    if (request.destination === "document" || url.pathname.endsWith(".html")) {
      return await networkFirst(request);
    }

    // Strategy 2: CSS/JS - Cache First (fast)
    if (
      request.destination === "script" ||
      request.destination === "style" ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css")
    ) {
      return await cacheFirst(request);
    }

    // Strategy 3: Images - Cache First
    if (
      request.destination === "image" ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
    ) {
      return await cacheFirst(request);
    }

    // Strategy 4: Other - Network First
    return await networkFirst(request);
  } catch (error) {
    console.error("[Service Worker] Fetch failed:", error);

    // Return offline page if HTML
    if (request.destination === "document") {
      const cache = await caches.open(CACHE_NAME);
      return cache.match("/pages/offline.html");
    }

    throw error;
  }
}

/**
 * Network First strategy
 * Try network, if fails - use cache
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);

    // Cache only successful responses
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[Service Worker] Network failed, trying cache:", request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Cache First strategy
 * Try cache, if not found - use network
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update in background (stale-while-revalidate)
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {
        // Ignore background update errors
      });

    return cachedResponse;
  }

  // If not in cache - fetch from network
  const networkResponse = await fetch(request);

  if (networkResponse && networkResponse.status === 200) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// ========================================
// MESSAGE EVENT (for updates)
// ========================================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("[Service Worker] Script loaded");
