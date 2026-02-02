/**
 * ========================================
 * SERVICE WORKER
 * ========================================
 * Забезпечує офлайн функціонал та кешування
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `city-assistant-${CACHE_VERSION}`;

// Файли для кешування
const APP_ASSETS = [
  "/",
  "/index.html",
  "/pages/add-place.html",
  "/pages/place-details.html",
  "/pages/offline.html",
  "/pages/edit-place.html",
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
// FETCH EVENT (Стратегії кешування)
// ========================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ігнорувати chrome-extension та інші протоколи
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Ігнорувати browser-sync та hot reload
  if (url.hostname === "localhost" && url.port === "3001") {
    return;
  }

  event.respondWith(handleFetch(request));
});

/**
 * Обробити fetch запит
 * @param {Request} request - HTTP запит
 * @returns {Promise<Response>}
 */
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // Стратегія 1: HTML - Network First (завжди свіже)
    if (request.destination === "document" || url.pathname.endsWith(".html")) {
      return await networkFirst(request);
    }

    // Стратегія 2: CSS/JS - Cache First (швидко)
    if (
      request.destination === "script" ||
      request.destination === "style" ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css")
    ) {
      return await cacheFirst(request);
    }

    // Стратегія 3: Зображення - Cache First
    if (
      request.destination === "image" ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
    ) {
      return await cacheFirst(request);
    }

    // Стратегія 4: Інше - Network First
    return await networkFirst(request);
  } catch (error) {
    console.error("[Service Worker] Fetch failed:", error);

    // Повернути офлайн сторінку якщо це HTML
    if (request.destination === "document") {
      const cache = await caches.open(CACHE_NAME);
      return cache.match("/pages/offline.html");
    }

    throw error;
  }
}

/**
 * Network First стратегія
 * Спробувати мережу, якщо не вийшло - взяти з кешу
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);

    // Кешувати тільки успішні відповіді
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
 * Cache First стратегія
 * Спробувати кеш, якщо немає - взяти з мережі
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Оновити в фоні (stale-while-revalidate)
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {
        // Ігнорувати помилки фонового оновлення
      });

    return cachedResponse;
  }

  // Якщо немає в кеші - завантажити з мережі
  const networkResponse = await fetch(request);

  if (networkResponse && networkResponse.status === 200) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// ========================================
// MESSAGE EVENT (для оновлення)
// ========================================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("[Service Worker] Script loaded");
