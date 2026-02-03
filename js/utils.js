/**
 * UTILITY FUNCTIONS
 */

// Toast notification system
function initToastContainer() {
  if (!document.getElementById("toast-container")) {
    const container = document.createElement("div");
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }
}

function showToast(message, type = "info", duration = 3000) {
  initToastContainer();
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");
  
  const icon = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close notification">×</button>
  `;
  
  const closeBtn = toast.querySelector(".toast-close");
  const closeToast = () => {
    toast.classList.add("toast-hiding");
    setTimeout(() => toast.remove(), 300);
  };
  
  closeBtn.addEventListener("click", closeToast);
  container.appendChild(toast);
  
  // Автоматичне закриття
  setTimeout(closeToast, duration);
  
  // Анімація появи
  setTimeout(() => toast.classList.add("toast-show"), 10);
}

function showError(message) {
  showToast(message, "error", 5000);
  console.error("[showError]", message);
}

function showSuccess(message) {
  showToast(message, "success", 3000);
}

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

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

async function compressPhoto(base64Data) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      let width = img.width;
      let height = img.height;

      if (width <= maxWidth && height <= maxHeight) {
        resolve(base64Data);
        return;
      }

      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      resolve(compressed);
    };

    img.onerror = () => reject(new Error("Image load error"));
    img.src = base64Data;
  });
}

