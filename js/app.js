(function () {
  // ✅ Register SW (works on Netlify + GitHub Pages)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("../service-worker.js")
        .catch(() => navigator.serviceWorker.register("./service-worker.js"))
        .then((reg) => reg && console.log("✅ SW registered:", reg.scope))
        .catch((err) => console.error("❌ SW register error:", err));
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      updateOnlineStatus();

      await initDB();

      const page = document.body.dataset.page;

      if (page === "index") await initIndexPage();
      if (page === "add") await initAddPlacePage();
      if (page === "details") await initDetailsPage();
      if (page === "edit") await initEditPlacePage();
    } catch (e) {
      console.error(e);
      showError("App init failed: " + (e?.message || e));
    }
  });
})();
