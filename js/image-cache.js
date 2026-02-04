/**
 * image-cache.js — photo helpers
 * Photos are stored as base64 strings directly in IndexedDB.
 */

(function () {
  "use strict";

  // Returns the photo data ready for <img src>
  async function getImageUrl(photoData) {
    if (!photoData || typeof photoData !== "string") return null;
    if (photoData.startsWith("data:image")) return photoData;
    return null;
  }

  // Returns the photo data ready to save into IndexedDB
  async function processImageForSave(imageData) {
    if (!imageData || typeof imageData !== "string") return "";
    if (imageData.startsWith("data:image")) return imageData;
    return "";
  }

  // no-ops kept for compatibility with existing call sites
  function deleteImageFromCache() {}
  function revokeObjectUrl() {}
  function revokeAllObjectUrls() {}

  window.CityImages = {
    getImageUrl,
    processImageForSave,
    deleteImageFromCache,
    revokeObjectUrl,
    revokeAllObjectUrls,
  };
})();
