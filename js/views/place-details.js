/**
 * views/place-details.js — place details + map preview + delete
 */

(function () {
  "use strict";

  async function initDetailsPage() {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (!id) throw new Error("ID not found");

      const placeId = Number(id);
      const place = await window.CityDB.getPlaceById(placeId);
      if (!place) throw new Error("Place not found");

      displayPlace(place);
      setupButtons(placeId);
    } catch (e) {
      console.error("[initDetailsPage]", e);
      window.CityUtils?.showError?.("Failed to load place");
      setTimeout(() => (window.location.href = "../index.html"), 900);
    }
  }

  function displayPlace(place) {
    const header = document.getElementById("place-name-header");
    if (header) header.textContent = place.name || "Place";

    const name = document.getElementById("place-name");
    if (name) name.textContent = place.name || "Untitled";

    const addr = document.getElementById("place-address");
    if (addr) addr.textContent = place.address || "—";

    const notesSection = document.getElementById("notes-section");
    const notes = document.getElementById("place-notes");
    if (place.notes && place.notes.trim()) {
      notesSection?.classList.remove("hidden");
      if (notes) notes.textContent = place.notes;
    } else {
      notesSection?.classList.add("hidden");
    }

    const photo = document.getElementById("place-photo");
    if (photo) {
      photo.src = "../images/placeholder.png";
      photo.onerror = () => (photo.src = "../images/placeholder.png");

      if (place.photo) {
        window.CityImages.getImageUrl(place.photo).then((url) => {
          if (!url) return;
          window.CityImages.revokeObjectUrl(photo.dataset.blobUrl);
          photo.dataset.blobUrl = url.startsWith("blob:") ? url : "";
          photo.src = url;
        });
      }
    }

    const date = document.getElementById("place-date");
    if (date && place.timestamp) {
      date.textContent = new Date(place.timestamp).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    displayCoordinates(place);
  }

  function displayCoordinates(place) {
    const coordsSection = document.getElementById("coordinates-section");
    const coordsText = document.getElementById("place-coordinates");
    const openMapsBtn = document.getElementById("open-maps-btn");
    const mapPreview = document.getElementById("map-preview");

    if (place.coordinates?.lat && place.coordinates?.lng) {
      const { lat, lng } = place.coordinates;

      coordsSection?.classList.remove("hidden");
      if (coordsText)
        coordsText.textContent = window.CityGeo.formatCoordinates(lat, lng);

      if (openMapsBtn) {
        openMapsBtn.href = `https://www.google.com/maps?q=${lat},${lng}`;
        openMapsBtn.style.display = "inline-flex";
      }

      if (mapPreview) {
        const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
        const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

        mapPreview.innerHTML = `
          <iframe
            src="${osmUrl}"
            title="Map preview"
            loading="lazy"
            referrerpolicy="no-referrer"
            style="border: none; width: 100%; height: 260px;"
          ></iframe>
        `;
        mapPreview.style.display = "block";
      }
    } else {
      coordsSection?.classList.add("hidden");
      if (openMapsBtn) openMapsBtn.style.display = "none";
      if (mapPreview) mapPreview.style.display = "none";
    }
  }

  function setupButtons(placeId) {
    const editBtn = document.getElementById("edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.href = `edit-place.html?id=${placeId}`;
      });
    }

    const deleteBtn = document.getElementById("delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => showDeleteModal(placeId));
    }
  }

  function showDeleteModal(placeId) {
    const modal = document.getElementById("delete-modal");
    if (!modal) return;

    modal.classList.remove("hidden");

    const confirmBtn = document.getElementById("confirm-delete-btn");
    const cancelBtn = document.getElementById("cancel-delete-btn");
    const overlay = modal.querySelector(".modal-overlay");

    if (confirmBtn) {
      confirmBtn.onclick = async () => handleDeletePlace(placeId);
    }

    const close = () => modal.classList.add("hidden");
    if (cancelBtn) cancelBtn.onclick = close;
    if (overlay) overlay.onclick = close;
  }

  async function handleDeletePlace(placeId) {
    try {
      const place = await window.CityDB.getPlaceById(placeId);
      if (place?.photo && place.photo.includes("/cached-images/")) {
        await window.CityImages.deleteImageFromCache(place.photo);
      }

      await window.CityDB.deletePlace(placeId);
      window.CityUtils.showSuccess("Place deleted!");

      setTimeout(() => (window.location.href = "../index.html"), 700);
    } catch (e) {
      console.error("[deletePlace]", e);
      window.CityUtils.showError("Failed to delete");
    }
  }

  window.initDetailsPage = initDetailsPage;
})();
