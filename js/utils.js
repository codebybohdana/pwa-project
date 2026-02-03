/**
 * utils.js — UI helpers, toast, loading, online status, safe HTML, image helpers
 */

(function () {
  "use strict";

  function initToastContainer() {
    if (!document.getElementById("toast-container")) {
      const container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");
      document.body.appendChild(container);
    }
  }

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  function showToast(message, type = "info", duration = 3000) {
    initToastContainer();

    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "alert");

    const icon = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icon}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">×</button>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    const closeToast = () => {
      toast.classList.add("toast-hiding");
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener("click", closeToast);
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("toast-show"), 10);
    setTimeout(closeToast, duration);
  }

  function showError(message) {
    console.error("[showError]", message);
    showToast(message, "error", 5000);
  }

  function showSuccess(message) {
    showToast(message, "success", 3000);
  }

  function showLoading(show) {
    const overlay = document.getElementById("loading-overlay");
    if (!overlay) return;
    overlay.classList.toggle("hidden", !show);
  }

  function updateOnlineStatus() {
    const statusElement = document.getElementById("online-status");
    const offlineBanner = document.getElementById("offline-banner");

    const update = () => {
      const isOnline = navigator.onLine;

      if (statusElement) {
        statusElement.innerHTML = isOnline
          ? '<span class="status-dot status-online" aria-hidden="true"></span><span class="status-text">Online</span>'
          : '<span class="status-dot status-offline" aria-hidden="true"></span><span class="status-text">Offline</span>';
      }

      if (offlineBanner) {
        offlineBanner.classList.toggle("hidden", isOnline);
      }
    };

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
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
        const maxW = 1920;
        const maxH = 1080;

        let w = img.width;
        let h = img.height;

        if (w <= maxW && h <= maxH) {
          resolve(base64Data);
          return;
        }

        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.floor(w * ratio);
        h = Math.floor(h * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(base64Data);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        resolve(compressed);
      };

      img.onerror = () => reject(new Error("Image load error"));
      img.src = base64Data;
    });
  }

  window.CityUtils = {
    escapeHtml,
    showToast,
    showError,
    showSuccess,
    showLoading,
    updateOnlineStatus,
    fileToBase64,
    compressPhoto,
  };
})();
