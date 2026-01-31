/**
 * ========================================
 * MAIN APPLICATION LOGIC
 * ========================================
 * Головний файл логіки додатку
 * З'єднує всі модулі разом
 */

// ========================================
// ГЛОБАЛЬНІ ЗМІННІ
// ========================================

// Для зберігання даних форми
let currentPhoto = null;
let currentCoordinates = null;

// ========================================
// INDEX.HTML - ГОЛОВНА СТОРІНКА
// ========================================

/**
 * Ініціалізація головної сторінки
 */
if (
  window.location.pathname.endsWith("index.html") ||
  window.location.pathname === "/"
) {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("📱 Ініціалізація головної сторінки...");

    try {
      // Ініціалізувати базу даних
      await initDB();

      // Завантажити всі місця
      await loadAndDisplayPlaces();

      // Налаштувати пошук
      setupSearch();

      // Налаштувати online/offline статус
      updateOnlineStatus();
    } catch (error) {
      console.error("❌ Помилка ініціалізації:", error);
      showError("Помилка завантаження додатку");
    }
  });
}

/**
 * Завантажити і відобразити всі місця
 */
async function loadAndDisplayPlaces() {
  try {
    console.log("📍 Завантаження місць...");

    const places = await getAllPlaces();
    displayPlaces(places);
  } catch (error) {
    console.error("❌ Помилка завантаження місць:", error);
    showError("Не вдалося завантажити місця");
  }
}

/**
 * Відобразити місця на сторінці
 * @param {Array} places - Масив місць
 */
function displayPlaces(places) {
  const placesList = document.getElementById("places-list");
  const emptyState = document.getElementById("empty-state");

  if (!placesList) return;

  // Очистити список
  placesList.innerHTML = "";

  // Якщо немає місць - показати empty state
  if (places.length === 0) {
    placesList.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  // Сховати empty state
  placesList.classList.remove("hidden");
  if (emptyState) emptyState.classList.add("hidden");

  // Створити картки для кожного місця
  places.forEach((place) => {
    const card = createPlaceCard(place);
    placesList.appendChild(card);
  });

  console.log(`✅ Відображено місць: ${places.length}`);
}

/**
 * Створити картку місця
 * @param {Object} place - Дані місця
 * @returns {HTMLElement} Елемент картки
 */
function createPlaceCard(place) {
  const card = document.createElement("div");
  card.className = "place-card";
  card.onclick = () => goToPlaceDetails(place.id);

  // Фото або placeholder
  const photoSrc = place.photo || "images/placeholder.png";

  // Дата
  const dateStr = new Date(place.timestamp).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  card.innerHTML = `
        <img src="${photoSrc}" alt="${
    place.name
  }" class="place-card-image" onerror="this.src='images/placeholder.png'">
        <div class="place-card-content">
            <h3 class="place-card-title">${escapeHtml(place.name)}</h3>
            <p class="place-card-address">${escapeHtml(place.address)}</p>
            <p class="place-card-meta">📅 ${dateStr}</p>
        </div>
    `;

  return card;
}

/**
 * Перейти на сторінку деталей місця
 * @param {number} id - ID місця
 */
function goToPlaceDetails(id) {
  window.location.href = `pages/place-details.html?id=${id}`;
}

/**
 * Налаштувати пошук
 */
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  // Debounce для пошуку
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const query = e.target.value;
      console.log("🔍 Пошук:", query);

      try {
        const results = await searchPlaces(query);
        displayPlaces(results);
      } catch (error) {
        console.error("❌ Помилка пошуку:", error);
      }
    }, 300); // 300ms затримка
  });
}

// ========================================
// ADD-PLACE.HTML - ДОДАВАННЯ МІСЦЯ
// ========================================

/**
 * Ініціалізація сторінки додавання місця
 */
if (window.location.pathname.includes("add-place.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("📝 Ініціалізація сторінки додавання...");

    try {
      // Ініціалізувати базу даних
      await initDB();

      // Налаштувати форму
      setupAddPlaceForm();

      // Налаштувати кнопку геолокації
      setupLocationButton();

      // Налаштувати кнопку камери
      setupCameraButton();
    } catch (error) {
      console.error("❌ Помилка ініціалізації:", error);
      showError("Помилка завантаження форми");
    }
  });
}

/**
 * Налаштувати форму додавання місця
 */
function setupAddPlaceForm() {
  const form = document.getElementById("add-place-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });
}

/**
 * Обробка відправки форми
 */
async function handleFormSubmit() {
  try {
    console.log("💾 Збереження місця...");

    // Показати loading
    showLoading(true);

    // Отримати дані з форми
    const name = document.getElementById("place-name").value.trim();
    const address = document.getElementById("place-address").value.trim();
    const notes = document.getElementById("place-notes").value.trim();

    // Валідація
    if (!name || !address) {
      throw new Error("Заповніть обов'язкові поля");
    }

    // Створити об'єкт місця
    const placeData = {
      name,
      address,
      notes: notes || "",
      photo: currentPhoto || "",
      coordinates: currentCoordinates || null,
      timestamp: Date.now(),
    };

    // Зберегти в базу даних
    const id = await addPlace(placeData);

    console.log("✅ Місце збережено з ID:", id);

    // Показати успіх
    showSuccess("Місце успішно збережено!");

    // Почекати трошки і перенаправити
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (error) {
    console.error("❌ Помилка збереження:", error);
    showError(error.message || "Не вдалося зберегти місце");
  } finally {
    showLoading(false);
  }
}

/**
 * Налаштувати кнопку отримання локації
 */
function setupLocationButton() {
  const btn = document.getElementById("get-location-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      console.log("📍 Отримання геолокації...");

      // Заблокувати кнопку
      btn.disabled = true;
      btn.textContent = "⏳ Отримання локації...";

      // Отримати координати
      const coords = await getCurrentPosition();
      currentCoordinates = coords;

      // Форматувати і показати
      const formatted = formatCoordinates(coords.lat, coords.lng);
      const display = document.getElementById("coordinates-display");
      const value = document.getElementById("coordinates-value");

      if (display && value) {
        value.textContent = formatted;
        display.classList.remove("hidden");
      }

      // Оновити кнопку
      btn.textContent = "✅ Локація отримана";
      btn.classList.add("button-success");

      console.log("✅ Координати:", coords);
    } catch (error) {
      console.error("❌ Помилка геолокації:", error);
      showError(error.message);
      btn.textContent = "📍 Спробувати ще раз";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Налаштувати кнопку камери
 */
function setupCameraButton() {
  const btn = document.getElementById("take-photo-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      console.log("📸 Відкриття камери...");

      // Заблокувати кнопку
      btn.disabled = true;
      btn.textContent = "⏳ Відкриття камери...";

      // Зробити фото
      const photoData = await takePhoto();
      currentPhoto = photoData;

      // Показати превью
      const preview = document.getElementById("photo-preview");
      const img = document.getElementById("photo-preview-img");

      if (preview && img) {
        img.src = photoData;
        preview.classList.remove("hidden");
      }

      // Налаштувати кнопку видалення фото
      const removeBtn = document.getElementById("remove-photo-btn");
      if (removeBtn) {
        removeBtn.onclick = () => {
          currentPhoto = null;
          preview.classList.add("hidden");
          btn.textContent = "📸 Зробити фото";
          btn.classList.remove("button-success");
        };
      }

      // Оновити кнопку
      btn.textContent = "✅ Фото зроблено";
      btn.classList.add("button-success");

      console.log("✅ Фото збережено");
    } catch (error) {
      console.error("❌ Помилка камери:", error);
      showError(error.message);
      btn.textContent = "📸 Спробувати ще раз";
    } finally {
      btn.disabled = false;
    }
  });
}

// ========================================
// PLACE-DETAILS.HTML - ДЕТАЛІ МІСЦЯ
// ========================================

/**
 * Ініціалізація сторінки деталей
 */
if (window.location.pathname.includes("place-details.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("📖 Ініціалізація сторінки деталей...");

    try {
      // Ініціалізувати базу даних
      await initDB();

      // Отримати ID з URL
      const urlParams = new URLSearchParams(window.location.search);
      const placeId = urlParams.get("id");

      if (!placeId) {
        throw new Error("ID місця не знайдено");
      }

      // Завантажити деталі місця
      await loadPlaceDetails(parseInt(placeId));

      // Налаштувати кнопки
      setupDetailsButtons(parseInt(placeId));
    } catch (error) {
      console.error("❌ Помилка завантаження деталей:", error);
      showError("Не вдалося завантажити місце");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
    }
  });
}

/**
 * Завантажити деталі місця
 * @param {number} id - ID місця
 */
async function loadPlaceDetails(id) {
  try {
    console.log("📖 Завантаження місця ID:", id);

    const place = await getPlaceById(id);

    if (!place) {
      throw new Error("Місце не знайдено");
    }

    // Відобразити дані
    displayPlaceDetails(place);
  } catch (error) {
    console.error("❌ Помилка:", error);
    throw error;
  }
}

/**
 * Відобразити деталі місця
 * @param {Object} place - Дані місця
 */
function displayPlaceDetails(place) {
  // Назва в header
  const headerTitle = document.getElementById("place-name-header");
  if (headerTitle) {
    headerTitle.textContent = place.name;
  }

  // Фото
  const photo = document.getElementById("place-photo");
  if (photo) {
    photo.src = place.photo || "../images/placeholder.png";
    photo.alt = place.name;
  }

  // Назва
  const name = document.getElementById("place-name");
  if (name) {
    name.textContent = place.name;
  }

  // Адреса
  const address = document.getElementById("place-address");
  if (address) {
    address.textContent = place.address;
  }

  // Нотатки
  const notes = document.getElementById("place-notes");
  const notesSection = document.getElementById("notes-section");
  if (place.notes && place.notes.trim()) {
    if (notes) notes.textContent = place.notes;
    if (notesSection) notesSection.classList.remove("hidden");
  } else {
    if (notesSection) notesSection.classList.add("hidden");
  }

  // Координати
  const coordinates = document.getElementById("place-coordinates");
  const coordsSection = document.getElementById("coordinates-section");
  if (place.coordinates) {
    if (coordinates) {
      coordinates.textContent = formatCoordinates(
        place.coordinates.lat,
        place.coordinates.lng
      );
    }
    if (coordsSection) coordsSection.classList.remove("hidden");
  } else {
    if (coordsSection) coordsSection.classList.add("hidden");
  }

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

  console.log("✅ Деталі відображено");
}

/**
 * Налаштувати кнопки на сторінці деталей
 * @param {number} placeId - ID місця
 */
function setupDetailsButtons(placeId) {
  // Кнопка "Редагувати"
  const editBtn = document.getElementById("edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      // TODO: Додати функціонал редагування
      showInfo("Функція редагування буде додана пізніше");
    });
  }

  // Кнопка "Видалити"
  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      showDeleteModal(placeId);
    });
  }
}

/**
 * Показати модальне вікно підтвердження видалення
 * @param {number} placeId - ID місця
 */
function showDeleteModal(placeId) {
  const modal = document.getElementById("delete-modal");
  if (!modal) return;

  modal.classList.remove("hidden");

  // Кнопка "Так, видалити"
  const confirmBtn = document.getElementById("confirm-delete-btn");
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      await handleDeletePlace(placeId);
    };
  }

  // Кнопка "Скасувати"
  const cancelBtn = document.getElementById("cancel-delete-btn");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      modal.classList.add("hidden");
    };
  }

  // Клік по overlay
  const overlay = modal.querySelector(".modal-overlay");
  if (overlay) {
    overlay.onclick = () => {
      modal.classList.add("hidden");
    };
  }
}

/**
 * Обробити видалення місця
 * @param {number} placeId - ID місця
 */
async function handleDeletePlace(placeId) {
  try {
    console.log("🗑️ Видалення місця ID:", placeId);

    // Видалити з бази даних
    await deletePlace(placeId);

    console.log("✅ Місце видалено");

    // Показати успіх
    showSuccess("Місце успішно видалено!");

    // Перенаправити на головну
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (error) {
    console.error("❌ Помилка видалення:", error);
    showError("Не вдалося видалити місце");
  }
}

// ========================================
// УТИЛІТИ
// ========================================

/**
 * Оновити статус online/offline
 */
function updateOnlineStatus() {
  const statusElement = document.getElementById("online-status");
  const offlineBanner = document.getElementById("offline-banner");

  const updateStatus = () => {
    const isOnline = navigator.onLine;

    if (statusElement) {
      statusElement.innerHTML = isOnline
        ? '<span class="status-dot status-online"></span><span class="status-text">Online</span>'
        : '<span class="status-dot status-offline"></span><span class="status-text">Offline</span>';
    }

    if (offlineBanner) {
      if (isOnline) {
        offlineBanner.classList.add("hidden");
      } else {
        offlineBanner.classList.remove("hidden");
      }
    }
  };

  // Початковий статус
  updateStatus();

  // Слухати зміни
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
}

/**
 * Показати/сховати loading overlay
 * @param {boolean} show - Показати чи сховати
 */
function showLoading(show) {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    if (show) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }
  }
}

/**
 * Показати повідомлення про помилку
 * @param {string} message - Текст помилки
 */
function showError(message) {
  alert("❌ " + message);
}

/**
 * Показати повідомлення про успіх
 * @param {string} message - Текст повідомлення
 */
function showSuccess(message) {
  alert("✅ " + message);
}

/**
 * Показати інформаційне повідомлення
 * @param {string} message - Текст повідомлення
 */
function showInfo(message) {
  alert("ℹ️ " + message);
}

/**
 * Екранувати HTML
 * @param {string} text - Текст для екранування
 * @returns {string} Екранований текст
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

console.log("✅ Модуль app.js завантажено");
