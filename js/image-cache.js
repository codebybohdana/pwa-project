/**
 * image-cache.js — Store place photos in Cache API (NOT base64 in IndexedDB)
 * - saves: base64 -> Cache API under (basePath)/cached-images/<id>
 * - reads: returns ObjectURL for display
 * - deletes: removes from cache
 */

(function () {
  "use strict";

  // IMPORTANT: must match your SW images cache name version (v2 in my SW example)
  const IMAGE_CACHE = "city-assistant-images-v2";

  const getBasePath = () => {
    // Works both for / and /subfolder/
    const path = window.location.pathname;
    if (path.endsWith("/index.html")) return path.replace("/index.html", "/");
    if (path.includes("/pages/")) return path.split("/pages/")[0] + "/";
    // if opened as /something/ keep folder
    if (path.endsWith("/")) return path;
    // default root
    return "/";
  };

  const basePath = getBasePath();
  const objectUrls = new Set();

  function base64ToBlob(base64, defaultMime = "image/jpeg") {
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const detected = base64.match(/data:([^;]+);/);
    const mime = detected ? detected[1] : defaultMime;

    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ab], { type: mime });
  }

  async function saveImageToCache(imageBase64, imageId) {
    const id =
      imageId || `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    // IMPORTANT: basePath-aware
    const imageUrl = `${basePath}cached-images/${id}`;

    const blob = base64ToBlob(imageBase64);
    const response = new Response(blob, {
      headers: { "Content-Type": blob.type || "image/jpeg" },
    });

    const cache = await caches.open(IMAGE_CACHE);
    await cache.put(imageUrl, response);

    // Store "virtual URL" in DB (string)
    return imageUrl;
  }

  async function getImageFromCache(imageUrl) {
    if (!imageUrl || !imageUrl.includes("/cached-images/")) return null;

    const cache = await caches.open(IMAGE_CACHE);
    const res = await cache.match(new Request(imageUrl, { cache: "no-store" }));
    if (!res) return null;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    objectUrls.add(url);
    return url;
  }

  async function deleteImageFromCache(imageUrl) {
    if (!imageUrl || !imageUrl.includes("/cached-images/")) return;
    const cache = await caches.open(IMAGE_CACHE);
    await cache.delete(new Request(imageUrl));
  }

  async function getImageUrl(photoData) {
    if (!photoData || typeof photoData !== "string") return null;

    if (photoData.startsWith("data:image")) return photoData;

    if (photoData.includes("/cached-images/")) {
      const cachedUrl = await getImageFromCache(photoData);
      return cachedUrl || null;
    }

    return null;
  }

  async function processImageForSave(imageData) {
    if (!imageData || typeof imageData !== "string") return "";
    if (imageData.includes("/cached-images/")) return imageData;
    if (imageData.startsWith("data:image"))
      return await saveImageToCache(imageData);
    return "";
  }

  function revokeObjectUrl(url) {
    if (!url || typeof url !== "string") return;
    if (!url.startsWith("blob:")) return;
    if (objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      objectUrls.delete(url);
    }
  }

  function revokeAllObjectUrls() {
    objectUrls.forEach((u) => URL.revokeObjectURL(u));
    objectUrls.clear();
  }

  window.CityImages = {
    IMAGE_CACHE,
    basePath,
    saveImageToCache,
    getImageFromCache,
    deleteImageFromCache,
    getImageUrl,
    processImageForSave,
    revokeObjectUrl,
    revokeAllObjectUrls,
  };
})();
