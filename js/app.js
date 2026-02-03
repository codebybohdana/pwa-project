/**
 * app.js
 * Головний запуск застосунку:
 * - ініціалізує IndexedDB один раз
 * - реєструє Service Worker
 * - оновлює Online/Offline статус
 * - запускає JS конкретного view (index/add/edit/details)
 */

(async function bootstrap() {
  try {
    // ✅ 1) База: тільки один раз
    await initDB();

    // ✅ 2) Статус онлайн/офлайн
    updateOnlineStatus();

    // ✅ 3) Service Worker
    registerServiceWorker();

    // ✅ 4) Запуск view за data-page
    const page = document.body.dataset.page;

    if (page === "index" && window.CityViews?.index) {
      await window.CityViews.index();
    }
    if (page === "add-place" && window.CityViews?.addPlace) {
      await window.CityViews.addPlace();
    }
    if (page === "edit-place" && window.CityViews?.editPlace) {
      await window.CityViews.editPlace();
    }
    if (page === "place-details" && window.CityViews?.placeDetails) {
      await window.CityViews.placeDetails();
    }
  } catch (err) {
    console.error("Critical init error:", err);
    alert("App failed to start: " + (err?.message || err));
  }
})();

/** Реєстрація Service Worker */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js");
      // console.log("SW registered:", reg.scope);

      // Якщо є оновлення — активуємо швидко
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    } catch (e) {
      console.warn("SW registration failed:", e);
    }
  });
}
