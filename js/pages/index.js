/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 * Helper functions for the entire app
 */

/**
 * Show error message
 */
function showError(message) {
  alert("❌ " + message);
  console.error("Error:", message);
}

/**
 * Show success message
 */
function showSuccess(message) {
  alert("✅ " + message);
  console.log("Success:", message);
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    if (show) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }
  }
}

/**
 * Update online/offline status
 */
function updateOnlineStatus() {
  const statusElement = document.getElementById("online-status");
  const offlineBanner = document.getElementById("offline-banner");

  const updateStatus = () => {
    const isOnline = navigator.onLine;

    if (statusElement) {
      statusElement.innerHTML = isOnline
        ? '<span class="status-dot status-online"></span><span class="status-text">Online</span>'
        : '<span class="status-dot status-offline"></span><span class="status-text">Offline</span>';
    }

    if (offlineBanner) {
      if (isOnline) {
        offlineBanner.classList.add("hidden");
      } else {
        offlineBanner.classList.remove("hidden");
      }
    }
  };

  updateStatus();
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

console.log("✅ utils.js loaded");
