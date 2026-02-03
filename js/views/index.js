/**
 * views/index.js
 * Логіка головної сторінки.
 */

window.CityViews = window.CityViews || {};

window.CityViews.index = async function () {
  const listEl = $("places-list");
  const emptyEl = $("empty-state");
  const searchEl = $("search-input");

  async function render(places) {
    listEl.innerHTML = "";

    if (!places.length) {
      listEl.classList.add("hidden");
      emptyEl.classList.remove("hidden");
      return;
    }

    emptyEl.classList.add("hidden");
    listEl.classList.remove("hidden");

    for (const place of places) {
      const card = document.createElement("div");
      card.className = "place-card";
      card.addEventListener("click", () => {
        window.location.href = `/pages/place-details.html?id=${place.id}`;
      });

      // ✅ Використовуємо thumbnail якщо є (для кращого performance)
      const imgSrc =
        place.photoThumb || place.photo || "/images/placeholder.png";

      const dateText = place.timestamp
        ? new Date(place.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";

      card.innerHTML = `
        <img
          class="place-card-image"
          src="${imgSrc}"
          alt="${escapeHtml(place.name)}"
          loading="lazy"
          decoding="async"
          onerror="this.src='/images/placeholder.png'"
        />
        <div class="place-card-content">
          <h3 class="place-card-title">${escapeHtml(place.name)}</h3>
          <p class="place-card-address">${escapeHtml(place.address)}</p>
          <p class="place-card-meta">📅 ${dateText}</p>
        </div>
      `;

      listEl.appendChild(card);
    }
  }

  // initial
  const places = await getAllPlaces();
  await render(places);

  // search (debounce)
  let t = null;
  searchEl?.addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(async () => {
      const q = e.target.value;
      const results = await searchPlaces(q);
      render(results);
    }, 250);
  });
};
