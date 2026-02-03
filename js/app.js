/**
 * app.js — bootstraps DB + routes per page
 */

(function () {
  "use strict";

  function currentPath() {
    return window.location.pathname || "";
  }

  function isIndexPage() {
    const p = currentPath();
    return p.endsWith("/index.html") || p.endsWith("/") || p === "";
  }

  function isAddPlacePage() {
    return currentPath().includes("add-place.html");
  }

  function isDetailsPage() {
    return currentPath().includes("place-details.html");
  }

  function isEditPage() {
    return currentPath().includes("edit-place.html");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await window.CityDB.initDB();

      // Online/offline UI
      if (window.CityUtils?.updateOnlineStatus) {
        window.CityUtils.updateOnlineStatus();
      }

      // Route to view init
      if (isIndexPage() && typeof window.initIndexPage === "function") {
        await window.initIndexPage();
      } else if (
        isAddPlacePage() &&
        typeof window.initAddPlacePage === "function"
      ) {
        await window.initAddPlacePage();
      } else if (
        isDetailsPage() &&
        typeof window.initDetailsPage === "function"
      ) {
        await window.initDetailsPage();
      } else if (isEditPage() && typeof window.initEditPage === "function") {
        await window.initEditPage();
      }
    } catch (e) {
      console.error("[App] Critical error:", e);
      window.CityUtils?.showError?.(
        "Error loading app: " + (e?.message || String(e))
      );
    }
  });

  // Cleanup blob URLs on navigation (helps memory/Lighthouse)
  window.addEventListener("beforeunload", () => {
    window.CityImages?.revokeAllObjectUrls?.();
  });
})();
