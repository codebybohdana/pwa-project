/**
 * ========================================
 * PLACE DETAILS PAGE - Деталі місця
 * ========================================
 */

/**
 * Ініціалізація сторінки деталей
 */
async function initDetailsPage() {
  console.log("📖 Ініціалізація деталей...");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get("id");

    if (!placeId) {
      throw new Error("ID не знайдено");
    }

    await loadPlaceDetails(parseInt(placeId));
    setupDetailsButtons(parseInt(placeId));
  } catch (error) {
    console.error("❌ Помилка:", error);
    showError("Не вдалося завантажити: " + error.message);
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
  }
}

/**
 * Завантажити деталі
 */
async function loadPlaceDetails(id) {
  const place = await getPlaceById(id);

  if (!place) {
    throw new Error("Місце не знайдено");
  }

  displayPlaceDetails(place);
}

/**
 * Відобразити деталі
 */
function displayPlaceDetails(place) {
  // Назва в header
  const headerTitle = document.getElementById("place-name-header");
  if (headerTitle) headerTitle.textContent = place.name || "Місце";

  // Фото
  const photo = document.getElementById("place-photo");
  if (photo) {
    photo.src = place.photo || "../images/placeholder.png";
    photo.onerror = () => (photo.src = "../images/placeholder.png");
  }

  // Назва
  const name = document.getElementById("place-name");
  if (name) name.textContent = place.name || "Без назви";

  // Адреса
  const address = document.getElementById("place-address");
  if (address) address.textContent = place.address || "—";

  // Нотатки
  const notes = document.getElementById("place-notes");
  const notesSection = document.getElementById("notes-section");
  if (place.notes && place.notes.trim()) {
    if (notes) notes.textContent = place.notes;
    if (notesSection) notesSection.classList.remove("hidden");
  } else {
    if (notesSection) notesSection.classList.add("hidden");
  }

  // Координати та карта
  displayCoordinates(place);

  // Дата
  const date = document.getElementById("place-date");
  if (date && place.timestamp) {
    date.textContent = new Date(place.timestamp).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

/**
 * Відобразити координати та карту
 */
function displayCoordinates(place) {
  const coordinates = document.getElementById("place-coordinates");
  const coordsSection = document.getElementById("coordinates-section");
  const openMapsBtn = document.getElementById("open-maps-btn");
  const mapPreview = document.getElementById("map-preview");

  if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
    const { lat, lng } = place.coordinates;

    // Координати текстом
    if (coordinates) {
      coordinates.textContent = formatCoordinates(lat, lng);
    }

    if (coordsSection) coordsSection.classList.remove("hidden");

    // Кнопка Google Maps
    if (openMapsBtn) {
      openMapsBtn.href = `https://www.google.com/maps?q=${lat},${lng}`;
      openMapsBtn.style.display = "inline-flex";
    }

    // Міні-карта OpenStreetMap
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

/**
 * Налаштувати кнопки
 */
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

/**
 * Показати модал видалення
 */
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

/**
 * Видалити місце
 */
async function handleDeletePlace(placeId) {
  try {
    await deletePlace(placeId);
    showSuccess("Місце видалено!");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (error) {
    console.error("❌ Помилка:", error);
    showError("Не вдалося видалити");
  }
}

console.log("✅ placeDetails.js завантажено");
