/**
 * views/index.js — list + search
 */

(function () {
  "use strict";

  async function loadAndDisplayPlaces() {
    const places = await window.CityDB.getAllPlaces();
    displayPlaces(places);
  }

  function goToPlaceDetails(id) {
    window.location.href = `pages/place-details.html?id=${id}`;
  }

  function createPlaceCard(place) {
    const card = document.createElement("div");
    card.className = "place-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `Place: ${window.CityUtils.escapeHtml(place.name || "Untitled")}`
    );

    const dateStr = place.timestamp
      ? new Date(place.timestamp).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Date not specified";

    card.innerHTML = `
      <img
        class="place-card-image"
        src="images/placeholder.png"
        alt="${window.CityUtils.escapeHtml(place.name || "Place photo")}"
        loading="lazy"
      />
      <div class="place-card-content">
        <h3 class="place-card-title">${window.CityUtils.escapeHtml(
          place.name || "Untitled"
        )}</h3>
        <p class="place-card-address">${window.CityUtils.escapeHtml(
          place.address || ""
        )}</p>
        <p class="place-card-meta">📅 ${window.CityUtils.escapeHtml(
          dateStr
        )}</p>
      </div>
    `;

    const img = card.querySelector(".place-card-image");
    img.onerror = () => (img.src = "images/placeholder.png");

    // Load cached image (if any)
    if (place.photo) {
      window.CityImages.getImageUrl(place.photo)
        .then((url) => {
          if (!url) return;
          // revoke previous blob if any
          window.CityImages.revokeObjectUrl(img.dataset.blobUrl);
          img.dataset.blobUrl = url.startsWith("blob:") ? url : "";
          img.src = url;
        })
        .catch(() => {});
    }

    card.addEventListener("click", () => goToPlaceDetails(place.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToPlaceDetails(place.id);
      }
    });

    return card;
  }

  function displayPlaces(places) {
    const placesList = document.getElementById("places-list");
    const emptyState = document.getElementById("empty-state");
    if (!placesList) return;

    placesList.innerHTML = "";

    if (!places.length) {
      placesList.classList.add("hidden");
      emptyState?.classList.remove("hidden");
      return;
    }

    placesList.classList.remove("hidden");
    emptyState?.classList.add("hidden");

    places.forEach((p) => placesList.appendChild(createPlaceCard(p)));
  }

  function setupSearch() {
    const input = document.getElementById("search-input");
    if (!input) return;

    let t;
    input.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(async () => {
        const q = input.value;
        try {
          const results = await window.CityDB.searchPlaces(q);
          displayPlaces(results);
        } catch (e) {
          console.error("[search]", e);
        }
      }, 250);
    });
  }

  window.initIndexPage = async function initIndexPage() {
    try {
      await loadAndDisplayPlaces();
      setupSearch();
    } catch (e) {
      console.error("[initIndexPage]", e);
      window.CityUtils?.showError?.("Failed to load places");
    }
  };
})();
