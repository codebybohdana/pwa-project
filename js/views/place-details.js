/**
 * PLACE DETAILS PAGE
 */

async function initDetailsPage() {
  console.log("📖 Initializing details page...");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get("id");

    if (!placeId) {
      throw new Error("ID not found");
    }

    await loadPlaceDetails(parseInt(placeId));
    setupDetailsButtons(parseInt(placeId));
  } catch (error) {
    console.error("❌ Error:", error);
    showError("Failed to load: " + error.message);
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
  }
}

async function loadPlaceDetails(id) {
  const place = await getPlaceById(id);

  if (!place) {
    throw new Error("Place not found");
  }

  displayPlaceDetails(place);
}

function displayPlaceDetails(place) {
  const headerTitle = document.getElementById("place-name-header");
  if (headerTitle) headerTitle.textContent = place.name || "Place";

  const photo = document.getElementById("place-photo");
  if (photo) {
    photo.src = place.photo || "../images/placeholder.png";
    photo.onerror = () => (photo.src = "../images/placeholder.png");
  }

  const name = document.getElementById("place-name");
  if (name) name.textContent = place.name || "Untitled";

  const address = document.getElementById("place-address");
  if (address) address.textContent = place.address || "—";

  const notes = document.getElementById("place-notes");
  const notesSection = document.getElementById("notes-section");
  if (place.notes && place.notes.trim()) {
    if (notes) notes.textContent = place.notes;
    if (notesSection) notesSection.classList.remove("hidden");
  } else {
    if (notesSection) notesSection.classList.add("hidden");
  }

  displayCoordinates(place);

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
}

function displayCoordinates(place) {
  const coordinates = document.getElementById("place-coordinates");
  const coordsSection = document.getElementById("coordinates-section");
  const openMapsBtn = document.getElementById("open-maps-btn");
  const mapPreview = document.getElementById("map-preview");

  if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
    const { lat, lng } = place.coordinates;

    if (coordinates) {
      coordinates.textContent = formatCoordinates(lat, lng);
    }

    if (coordsSection) coordsSection.classList.remove("hidden");

    if (openMapsBtn) {
      openMapsBtn.href = `https://www.google.com/maps?q=${lat},${lng}`;
      openMapsBtn.style.display = "inline-flex";
    }

    if (mapPreview) {
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
        lng - 0.01
      },${lat - 0.01},${lng + 0.01},${
        lat + 0.01
      }&layer=mapnik&marker=${lat},${lng}`;

      mapPreview.innerHTML = `<iframe src="${osmUrl}" style="border: none;"></iframe>`;
      mapPreview.style.display = "block";
    }
  } else {
    if (coordsSection) coordsSection.classList.add("hidden");
  }
}

function setupDetailsButtons(placeId) {
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
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      await handleDeletePlace(placeId);
    };
  }

  const cancelBtn = document.getElementById("cancel-delete-btn");
  if (cancelBtn) {
    cancelBtn.onclick = () => modal.classList.add("hidden");
  }

  const overlay = modal.querySelector(".modal-overlay");
  if (overlay) {
    overlay.onclick = () => modal.classList.add("hidden");
  }
}

async function handleDeletePlace(placeId) {
  try {
    await deletePlace(placeId);
    showSuccess("Place deleted!");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (error) {
    console.error("❌ Error:", error);
    showError("Failed to delete");
  }
}

console.log("✅ place-details.js loaded");
