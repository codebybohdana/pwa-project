/**
 * views/place-details.js
 * Деталі місця + мапа.
 */

window.CityViews = window.CityViews || {};

window.CityViews.placeDetails = async function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    showError("ID not found.");
    window.location.href = "/index.html";
    return;
  }

  const place = await getPlaceById(id);
  if (!place) {
    showError("Place not found.");
    window.location.href = "/index.html";
    return;
  }

  // header + title
  const headerTitle = $("place-name-header");
  const nameEl = $("place-name");
  if (headerTitle) headerTitle.textContent = place.name || "Place Details";
  if (nameEl) nameEl.textContent = place.name || "Untitled";

  // photo
  const photoEl = $("place-photo");
  if (photoEl) {
    photoEl.src = place.photo || place.photoThumb || "/images/placeholder.png";
    photoEl.onerror = () => (photoEl.src = "/images/placeholder.png");
  }

  // address + notes
  $("place-address").textContent = place.address || "—";

  const notesSection = $("notes-section");
  if (place.notes && place.notes.trim()) {
    $("place-notes").textContent = place.notes;
    notesSection.classList.remove("hidden");
  } else {
    notesSection.classList.add("hidden");
  }

  // date
  const dateEl = $("place-date");
  if (dateEl && place.timestamp) {
    dateEl.textContent = new Date(place.timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // coordinates + map
  const coordsSection = $("coordinates-section");
  const coordsText = $("place-coordinates");
  const openMapsBtn = $("open-maps-btn");
  const mapPreview = $("map-preview");
  const mapHint = $("map-offline-hint");

  if (place.coordinates?.lat && place.coordinates?.lng) {
    const { lat, lng } = place.coordinates;

    coordsText.textContent = formatCoordinates(lat, lng);

    openMapsBtn.href = `https://www.google.com/maps?q=${lat},${lng}`;
    openMapsBtn.style.display = "inline-flex";

    // ✅ Мапу показуємо тільки коли online (щоб не ламати offline)
    if (navigator.onLine) {
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
        lng - 0.01
      },${lat - 0.01},${lng + 0.01},${
        lat + 0.01
      }&layer=mapnik&marker=${lat},${lng}`;

      mapPreview.innerHTML = `<iframe src="${osmUrl}" style="border:none;"></iframe>`;
      mapPreview.style.display = "block";
      mapHint.classList.add("hidden");
    } else {
      mapPreview.style.display = "none";
      mapHint.classList.remove("hidden");
    }
  } else {
    coordsSection.classList.add("hidden");
  }

  // buttons
  $("edit-btn").addEventListener("click", () => {
    window.location.href = `/pages/edit-place.html?id=${place.id}`;
  });

  $("delete-btn").addEventListener("click", () => openDeleteModal(place.id));
};

function openDeleteModal(placeId) {
  const modal = $("delete-modal");
  modal.classList.remove("hidden");

  const close = () => modal.classList.add("hidden");

  $("cancel-delete-btn").onclick = close;
  modal.querySelector(".modal-overlay").onclick = close;

  $("confirm-delete-btn").onclick = async () => {
    try {
      await deletePlace(placeId);
      showSuccess("Place deleted.");
      window.location.href = "/index.html";
    } catch (e) {
      showError("Failed to delete.");
    }
  };
}
