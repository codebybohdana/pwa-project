/**
 * Service Worker: cache shell + zdjęcia miejsc.
 * Strategia: Network First (fallback do cache); /cached-images/ → Cache Only; dokumenty bez cache → offline.html.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `city-assistant-${CACHE_VERSION}`;
const IMAGES_CACHE_NAME = `city-assistant-images-v1`;

// Отримуємо базовий шлях від місця розташування Service Worker
const getBasePath = () => {
  const basePath = self.location.pathname.replace('/service-worker.js', '');
  return basePath || '/';
};

const basePath = getBasePath();

const APP_ASSETS = [
  `${basePath}index.html`,
  `${basePath}pages/add-place.html`,
  `${basePath}pages/place-details.html`,
  `${basePath}pages/edit-place.html`,
  `${basePath}pages/offline.html`,
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

// Додаємо головну сторінку як "/" або базовий шлях
if (basePath === '/') {
  APP_ASSETS.unshift('/');
} else {
  APP_ASSETS.unshift(basePath);
}

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
            // Видаляємо старі кеші, які не відповідають поточним версіям
            if (cacheName !== CACHE_NAME && cacheName !== IMAGES_CACHE_NAME && 
                cacheName.startsWith('city-assistant-')) {
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

  // Обробка запитів до зображень з Cache API
  const cachedImagePath = basePath === '/' ? '/cached-images/' : `${basePath}cached-images/`;
  if (url.pathname.startsWith(cachedImagePath) || url.pathname.startsWith("/cached-images/")) {
    event.respondWith(
      caches.open(IMAGES_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response("Image not found", { status: 404 });
        });
      })
    );
    return;
  }

  // Перевіряємо, чи це запит зображення з нашого домену
  const isImageRequest = request.destination === "image" && 
                         url.origin === self.location.origin;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          const cacheToUse = isImageRequest ? IMAGES_CACHE_NAME : CACHE_NAME;
          caches.open(cacheToUse).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Спочатку перевіряємо основний кеш
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Якщо це зображення, перевіряємо кеш зображень
          if (isImageRequest) {
            return caches.open(IMAGES_CACHE_NAME).then((cache) => {
              return cache.match(request);
            });
          }
          // Якщо це документ і не знайдено в кеші, показуємо offline сторінку
          if (request.destination === "document") {
            return caches.match(`${basePath}pages/offline.html`).then((offlinePage) => {
              return offlinePage || new Response("Offline", { status: 503 });
            });
          }
        });
      })
  );
});
