/**
 * MAIN APPLICATION
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

function isEditPage() {
  return currentPath.includes("edit-place.html");
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Starting app...");

  try {
    await initDB();

    if (isIndexPage() && typeof initIndexPage === "function") {
      await initIndexPage();
    } else if (isAddPlacePage() && typeof initAddPlacePage === "function") {
      await initAddPlacePage();
    } else if (isDetailsPage() && typeof initDetailsPage === "function") {
      await initDetailsPage();
    } else if (isEditPage() && typeof initEditPage === "function") {
      await initEditPage();
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
