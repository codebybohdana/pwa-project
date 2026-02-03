/**
 * ========================================
 * MAIN APPLICATION
 * ========================================
 * Entry point - initialization only
 */

// Determine current page
const currentPath = window.location.pathname;

// Page checks
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

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starting app...");

  try {
    // Initialize database
    await initDB();

    // Initialize appropriate page
    if (isIndexPage() && typeof initIndexPage === "function") {
      await initIndexPage();
    } else if (isAddPlacePage() && typeof initAddPlacePage === "function") {
      await initAddPlacePage();
    } else if (isDetailsPage() && typeof initDetailsPage === "function") {
      await initDetailsPage();
    }

    // Always update online status
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
