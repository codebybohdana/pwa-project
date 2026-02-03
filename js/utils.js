/**
 * utils.js
 * Допоміжні функції. Коментарі українською, UI лишається англійською.
 */

function $(id) {
  return document.getElementById(id);
}

/** Показати повідомлення про помилку */
function showError(message) {
  alert("❌ " + message);
}

/** Показати повідомлення про успіх */
function showSuccess(message) {
  alert("✅ " + message);
}

/** Показати/сховати overlay */
function showLoading(show) {
  const overlay = $("loading-overlay");
  if (!overlay) return;
  overlay.classList.toggle("hidden", !show);
}

/** Онлайн/офлайн статус у header + банер */
function updateOnlineStatus() {
  const statusEl = $("online-status");
  const banner = $("offline-banner");

  const render = () => {
    const online = navigator.onLine;

    if (statusEl) {
      statusEl.innerHTML = online
        ? '<span class="status-dot status-online"></span><span class="status-text">Online</span>'
        : '<span class="status-dot status-offline"></span><span class="status-text">Offline</span>';
    }

    if (banner) {
      banner.classList.toggle("hidden", online);
    }
  };

  render();
  window.addEventListener("online", render);
  window.addEventListener("offline", render);
}

/** Екранування HTML */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

/**
 * Стиснення картинки до потрібного розміру
 * @param {string} dataUrl base64 dataUrl
 * @param {number} maxW
 * @param {number} maxH
 * @param {number} quality 0..1
 */
function resizeImageDataUrl(dataUrl, maxW, maxH, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      const ratio = Math.min(maxW / width, maxH / height, 1);
      const newW = Math.round(width * ratio);
      const newH = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = newW;
      canvas.height = newH;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, newW, newH);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => reject(new Error("Image load error"));
    img.src = dataUrl;
  });
}

/** File -> base64 dataUrl */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("File read error"));
    r.readAsDataURL(file);
  });
}

// Експортуємо в window (бо без bundler)
window.$ = $;
window.showError = showError;
window.showSuccess = showSuccess;
window.showLoading = showLoading;
window.updateOnlineStatus = updateOnlineStatus;
window.escapeHtml = escapeHtml;
window.resizeImageDataUrl = resizeImageDataUrl;
window.fileToDataUrl = fileToDataUrl;
