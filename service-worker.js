/**
 * ========================================
 * SERVICE WORKER
 * ========================================
 * Provides offline functionality and caching
 */

const CACHE_VERSION = "v2";
const CACHE_NAME = `city-assistant-${CACHE_VERSION}`;

/**
 * IMPORTANT:
 * Using RELATIVE paths (./) so it works both on:
 * - Netlify (root)
 * - GitHub Pages (/repo-name/)
 */
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  "./css/styles.css",

  "./js/app.js",
  "./js/db.js",
  "./js/utils.js",
  "./js/camera.js",
  "./js/geolocation.js",
  "./js/edit.js",

  "./js/pages/index.js",
  "./js/pages/addPlace.js",
  "./js/pages/placeDetails.js",

  "./pages/add-place.html",
  "./pages/place-details.html",
  "./pages/edit-place.html",
  "./pages/offline.html",

  "./images/placeholder.png",
  "./images/icons/icon-72.png",
  "./images/icons/icon-96.png",
  "./images/icons/icon-144.png",
  "./images/icons/icon-192.png",
  "./images/icons/icon-384.png",
  "./images/icons/icon-512.png",
  "./images/icons/icon-192-maskable.png",
  "./images/icons/icon-512-maskable.png",
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
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log("[Service Worker] Deleting old cache:", name);
              return caches.delete(name);
            }
          })
        )
      )
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

  // Ignore non-http(s)
  if (!url.protocol.startsWith("http")) return;

  // Ignore dev hot reload etc.
  if (url.hostname === "localhost" && url.port === "3001") return;

  event.respondWith(handleFetch(request));
});

/**
 * Handle fetch request
 * @param {Request} request
 */
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // HTML -> Network First (but with cache fallback)
    if (request.destination === "document" || url.pathname.endsWith(".html")) {
      return await networkFirst(request);
    }

    // CSS/JS -> Cache First (fast)
    if (
      request.destination === "script" ||
      request.destination === "style" ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css")
    ) {
      return await cacheFirst(request);
    }

    // Images -> Cache First
    if (
      request.destination === "image" ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
    ) {
      return await cacheFirst(request);
    }

    // Other -> Network First
    return await networkFirst(request);
  } catch (error) {
    console.error("[Service Worker] Fetch failed:", error);

    // Offline fallback for documents
    if (request.destination === "document") {
      const cache = await caches.open(CACHE_NAME);
      return cache.match("./pages/offline.html");
    }

    throw error;
  }
}

/**
 * Network First strategy
 * - try network
 * - if fails: try cache by full request
 * - if fails: try cache by pathname without query (?id=...)
 * - if fails: try cache ignoreSearch
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[Service Worker] Network failed, trying cache:", request.url);

    // 1) exact match (includes query)
    const cached = await cache.match(request);
    if (cached) return cached;

    // 2) fallback to same path WITHOUT query string
    const byPath = await cache.match(url.pathname);
    if (byPath) return byPath;

    // 3) ignoreSearch match
    const ignoreSearch = await cache.match(request, { ignoreSearch: true });
    if (ignoreSearch) return ignoreSearch;

    throw error;
  }
}

/**
 * Cache First strategy
 * - return cached immediately if exists
 * - update in background (stale-while-revalidate)
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Background update
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {});
    return cachedResponse;
  }

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
