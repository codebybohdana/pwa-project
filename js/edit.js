/**
 * ========================================
 * EDIT PLACE MODULE
 * ========================================
 * Модуль для редагування існуючого місця
 */

// Глобальні змінні
let currentPlaceId = null;
let currentPlace = null;
let newPhoto = null;
let newCoordinates = null;

/**
 * Ініціалізація сторінки редагування
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✏️ Ініціалізація сторінки редагування...");

  try {
    // Ініціалізувати базу даних
    await initDB();

    // Отримати ID з URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPlaceId = urlParams.get("id");

    if (!currentPlaceId) {
      throw new Error("ID місця не знайдено");
    }

    console.log("Редагування місця ID:", currentPlaceId);

    // Завантажити дані місця
    await loadPlaceForEditing(parseInt(currentPlaceId));

    // Налаштувати форму
    setupEditForm();

    // Налаштувати кнопку зміни фото
    setupChangePhotoButton();

    // Налаштувати кнопку оновлення локації
    setupUpdateLocationButton();

    // Налаштувати кнопки навігації
    setupNavigationButtons();
  } catch (error) {
    console.error("❌ Помилка ініціалізації:", error);
    alert("Помилка: " + error.message);
    window.location.href = "../index.html";
  }
});

/**
 * Завантажити дані місця для редагування
 */
async function loadPlaceForEditing(id) {
  try {
    console.log("📖 Завантаження місця для редагування...");

    const place = await getPlaceById(id);

    if (!place) {
      throw new Error("Місце не знайдено");
    }

    currentPlace = place;
    console.log("Місце завантажено:", place);

    // Заповнити форму
    fillFormWithPlaceData(place);
  } catch (error) {
    console.error("❌ Помилка завантаження:", error);
    throw error;
  }
}

/**
 * Заповнити форму даними місця
 */
function fillFormWithPlaceData(place) {
  console.log("📝 Заповнення форми...");

  // Назва
  const nameInput = document.getElementById("place-name");
  if (nameInput) nameInput.value = place.name || "";

  // Адреса
  const addressInput = document.getElementById("place-address");
  if (addressInput) addressInput.value = place.address || "";

  // Нотатки
  const notesInput = document.getElementById("place-notes");
  if (notesInput) notesInput.value = place.notes || "";

  // Поточне фото
  const currentPhotoImg = document.getElementById("current-photo-img");
  if (currentPhotoImg) {
    currentPhotoImg.src = place.photo || "../images/placeholder.png";
    currentPhotoImg.onerror = function () {
      this.src = "../images/placeholder.png";
    };
  }

  // Поточні координати
  const currentCoordsGroup = document.getElementById("current-coords-group");
  const currentCoordsValue = document.getElementById(
    "current-coordinates-value"
  );

  if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
    const formatted = formatCoordinates(
      place.coordinates.lat,
      place.coordinates.lng
    );
    if (currentCoordsValue) currentCoordsValue.textContent = formatted;
    if (currentCoordsGroup) currentCoordsGroup.classList.remove("hidden");
  } else {
    if (currentCoordsValue)
      currentCoordsValue.textContent = "Координати не вказані";
  }

  console.log("✅ Форма заповнена");
}

/**
 * Налаштувати форму редагування
 */
function setupEditForm() {
  const form = document.getElementById("edit-place-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleEditFormSubmit();
  });
}

/**
 * Обробка відправки форми редагування
 */
async function handleEditFormSubmit() {
  try {
    console.log("💾 Збереження змін...");

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

    // Створити оновлений об'єкт місця
    const updatedPlace = {
      ...currentPlace, // Зберегти всі старі дані
      name,
      address,
      notes: notes || "",
    };

    // Оновити фото якщо є нове
    if (newPhoto) {
      updatedPlace.photo = newPhoto;
      console.log("✅ Фото оновлено");
    }

    // Оновити координати якщо є нові
    if (newCoordinates) {
      updatedPlace.coordinates = newCoordinates;
      console.log("✅ Координати оновлено");
    }

    // Оновити timestamp
    updatedPlace.timestamp = Date.now();

    console.log("Оновлені дані:", updatedPlace);

    // Зберегти в базу даних
    await updatePlace(currentPlaceId, updatedPlace);

    console.log("✅ Зміни збережено");

    // Показати успіх
    alert("✅ Зміни успішно збережено!");

    // Перенаправити на сторінку деталей
    window.location.href = `place-details.html?id=${currentPlaceId}`;
  } catch (error) {
    console.error("❌ Помилка збереження:", error);
    alert("❌ " + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * Налаштувати кнопку зміни фото
 */
function setupChangePhotoButton() {
  const btn = document.getElementById("change-photo-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      console.log("📸 Зміна фото...");

      // Заблокувати кнопку
      btn.disabled = true;
      btn.textContent = "⏳ Відкриття камери...";

      // Зробити нове фото
      const photoData = await takePhoto();
      newPhoto = photoData;

      // Показати превью нового фото
      const preview = document.getElementById("new-photo-preview");
      const img = document.getElementById("new-photo-img");

      if (preview && img) {
        img.src = photoData;
        preview.classList.remove("hidden");
      }

      // Налаштувати кнопку видалення нового фото
      const removeBtn = document.getElementById("remove-new-photo-btn");
      if (removeBtn) {
        removeBtn.onclick = () => {
          newPhoto = null;
          preview.classList.add("hidden");
          btn.textContent = "📸 Зробити нове фото";
        };
      }

      // Оновити кнопку
      btn.textContent = "✅ Нове фото готове";

      console.log("✅ Нове фото збережено");
    } catch (error) {
      console.error("❌ Помилка камери:", error);
      alert("❌ " + error.message);
      btn.textContent = "📸 Спробувати ще раз";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Налаштувати кнопку оновлення локації
 */
function setupUpdateLocationButton() {
  const btn = document.getElementById("update-location-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      console.log("📍 Оновлення геолокації...");

      // Заблокувати кнопку
      btn.disabled = true;
      btn.textContent = "⏳ Отримання локації...";

      // Отримати нові координати
      const coords = await getCurrentPosition();
      newCoordinates = coords;

      // Форматувати і показати
      const formatted = formatCoordinates(coords.lat, coords.lng);
      const display = document.getElementById("new-coordinates-display");
      const value = document.getElementById("new-coordinates-value");

      if (display && value) {
        value.textContent = formatted;
        display.classList.remove("hidden");
      }

      // Налаштувати кнопку попереднього перегляду
      const previewBtn = document.getElementById("preview-new-location");
      if (previewBtn) {
        const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
        previewBtn.href = mapsUrl;
        previewBtn.style.display = "inline-flex";
      }

      // Оновити кнопку
      btn.textContent = "✅ Нова локація отримана";

      console.log("✅ Нові координати:", coords);
    } catch (error) {
      console.error("❌ Помилка геолокації:", error);
      alert("❌ " + error.message);
      btn.textContent = "📍 Спробувати ще раз";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Налаштувати кнопки навігації
 */
function setupNavigationButtons() {
  // Кнопка "Назад"
  const backBtn = document.getElementById("back-button");
  if (backBtn) {
    backBtn.href = `place-details.html?id=${currentPlaceId}`;
  }

  // Кнопка "Скасувати"
  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.href = `place-details.html?id=${currentPlaceId}`;
  }
}

/**
 * Показати/сховати loading overlay
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

console.log("✅ Модуль edit.js завантажено");
