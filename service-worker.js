const CACHE_VERSION = "v3";
const CACHE_NAME = `city-assistant-${CACHE_VERSION}`;

const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  "./css/styles.css",

  "./js/app.js",
  "./js/db.js",
  "./js/utils.js",
  "./js/geolocation.js",
  "./js/camera.js",

  "./js/pages/index.js",
  "./js/pages/addPlace.js",
  "./js/pages/placeDetails.js",
  "./js/pages/editPlace.js",

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

  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    (async () => {
      // HTML => network-first + fallback (важливо для ?id=...)
      if (req.destination === "document") {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_NAME);

          // exact (with query)
          let cached = await cache.match(req);
          if (cached) return cached;

          // fallback without query
          cached = await cache.match(url.pathname);
          if (cached) return cached;

          // ignoreSearch
          cached = await cache.match(req, { ignoreSearch: true });
          if (cached) return cached;

          return cache.match("./pages/offline.html");
        }
      }

      // CSS/JS/IMG => cache-first
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);

      if (cached) {
        // update in background
        fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
          })
          .catch(() => {});
        return cached;
      }

      const res = await fetch(req);
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    })()
  );
});
