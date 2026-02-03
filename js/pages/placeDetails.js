async function initDetailsPage() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    showError("ID not found");
    window.location.href = "../index.html";
    return;
  }

  const place = await getPlaceById(id);
  if (!place) {
    showError("Place not found");
    window.location.href = "../index.html";
    return;
  }

  renderDetails(place);
  setupButtons(place.id);
}

function renderDetails(place) {
  $("place-name-header").textContent = place.name || "Place Details";
  $("place-name").textContent = place.name || "Untitled";
  $("place-address").textContent = place.address || "—";

  const photo = $("place-photo");
  photo.src = place.photo || "../images/placeholder.png";
  photo.onerror = () => (photo.src = "../images/placeholder.png");

  // notes
  if (place.notes && place.notes.trim()) {
    $("place-notes").textContent = place.notes;
    $("notes-section").classList.remove("hidden");
  } else {
    $("notes-section").classList.add("hidden");
  }

  // coords + maps
  if (place.coordinates?.lat && place.coordinates?.lng) {
    const { lat, lng } = place.coordinates;
    $("place-coordinates").textContent = formatCoordinates(lat, lng);
    $("coordinates-section").classList.remove("hidden");

    const maps = $("open-maps-btn");
    maps.href = `https://www.google.com/maps?q=${lat},${lng}`;
    maps.hidden = false;

    const mapBox = $("map-preview");
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
      lng - 0.01
    },${lat - 0.01},${lng + 0.01},${
      lat + 0.01
    }&layer=mapnik&marker=${lat},${lng}`;
    mapBox.innerHTML = `<iframe src="${osmUrl}" loading="lazy"></iframe>`;
    mapBox.style.display = "block";
  } else {
    $("coordinates-section").classList.add("hidden");
  }

  // date
  $("place-date").textContent = place.timestamp
    ? new Date(place.timestamp).toLocaleString()
    : "—";
}

function setupButtons(id) {
  $("edit-btn").addEventListener("click", () => {
    window.location.href = `./edit-place.html?id=${id}`;
  });

  $("delete-btn").addEventListener("click", () => openDeleteModal(id));
}

function openDeleteModal(id) {
  const modal = $("delete-modal");
  modal.classList.remove("hidden");

  $("confirm-delete-btn").onclick = async () => {
    await deletePlace(id);
    showSuccess("Deleted!");
    window.location.href = "../index.html";
  };

  $("cancel-delete-btn").onclick = () => modal.classList.add("hidden");
  modal.querySelector(".modal-overlay").onclick = () =>
    modal.classList.add("hidden");
}
