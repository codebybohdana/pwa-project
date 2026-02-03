function $(id) {
  return document.getElementById(id);
}

function showError(message) {
  alert("❌ " + message);
  console.error(message);
}

function showSuccess(message) {
  alert("✅ " + message);
  console.log(message);
}

function showLoading(show, text = "Loading...") {
  const overlay = $("loading-overlay");
  if (!overlay) return;
  overlay.classList.toggle("hidden", !show);
  const p = overlay.querySelector("p");
  if (p) p.textContent = text;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateOnlineStatus() {
  const statusEl = $("online-status");
  const banner = $("offline-banner");

  const apply = () => {
    const online = navigator.onLine;

    if (statusEl) {
      statusEl.innerHTML = online
        ? `<span class="status-dot status-online"></span><span class="status-text">Online</span>`
        : `<span class="status-dot status-offline"></span><span class="status-text">Offline</span>`;
    }

    if (banner) {
      banner.classList.toggle("hidden", online);
    }
  };

  apply();
  window.addEventListener("online", apply);
  window.addEventListener("offline", apply);
}
