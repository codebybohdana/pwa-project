/**
 * ========================================
 * MAIN APPLICATION
 * ========================================
 * Entry point - initialization + SW registration
 */

const currentPath = window.location.pathname;

function isIndexPage() {
  return (
    currentPath.endsWith("index.html") ||
    currentPath === "/" ||
    currentPath === ""
  );
}

function isAddPlacePage() {
  return currentPath.includes("add-place.html");
}

function isDetailsPage() {
  return currentPath.includes("place-details.html");
}

/**
 * Register Service Worker (works for all pages)
 */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("../service-worker.js")
      .catch(() => {
        // When we are on index.html, path is different
        return navigator.serviceWorker.register("./service-worker.js");
      })
      .then((reg) => {
        if (reg) console.log("✅ SW registered", reg.scope);
      })
      .catch((err) => console.error("❌ SW registration failed", err));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starting app...");

  try {
    registerServiceWorker();

    // init db once
    await initDB();

    if (isIndexPage() && typeof initIndexPage === "function") {
      await initIndexPage();
    } else if (isAddPlacePage() && typeof initAddPlacePage === "function") {
      await initAddPlacePage();
    } else if (isDetailsPage() && typeof initDetailsPage === "function") {
      await initDetailsPage();
    }

    if (typeof updateOnlineStatus === "function") {
      updateOnlineStatus();
    }

    console.log("✅ App initialized");
  } catch (error) {
    console.error("❌ Critical error:", error);
    alert("Error loading app: " + error.message);
  }
});

console.log("✅ app.js loaded");
