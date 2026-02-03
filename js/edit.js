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
    setupChooseNewPhotoButton();

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
  const currentMapsBtn = document.getElementById("current-location-maps-btn");
  const currentMapPreview = document.getElementById("current-map-preview");

  if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
    const { lat, lng } = place.coordinates;
    const formatted = formatCoordinates(lat, lng);

    // Показати координати текстом
    if (currentCoordsValue) {
      currentCoordsValue.textContent = formatted;
    }

    if (currentCoordsGroup) {
      currentCoordsGroup.classList.remove("hidden");
    }

    // Показати кнопку Google Maps
    if (currentMapsBtn) {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      currentMapsBtn.href = mapsUrl;
      currentMapsBtn.style.display = "inline-flex";
    }

    // ДОДАТИ: Показати міні-карту
    if (currentMapPreview) {
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
        lng - 0.01
      },${lat - 0.01},${lng + 0.01},${
        lat + 0.01
      }&layer=mapnik&marker=${lat},${lng}`;

      currentMapPreview.innerHTML = `<iframe src="${osmUrl}" style="border: none;"></iframe>`;
      currentMapPreview.style.display = "block";
    }
  } else {
    if (currentCoordsValue) {
      currentCoordsValue.textContent = "Координати не вказані";
    }
    if (currentMapsBtn) {
      currentMapsBtn.style.display = "none";
    }
    if (currentMapPreview) {
      currentMapPreview.style.display = "none";
    }
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
 * Налаштувати кнопку вибору з галереї
 */
function setupChooseNewPhotoButton() {
  const btn = document.getElementById("choose-new-photo-btn");
  const fileInput = document.getElementById("new-photo-file-input");

  if (!btn || !fileInput) return;

  btn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      btn.disabled = true;
      btn.textContent = "⏳ Завантаження...";

      if (!file.type.startsWith("image/")) {
        throw new Error("Будь ласка, виберіть файл зображення");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Файл занадто великий. Максимум 10MB");
      }

      const photoData = await fileToBase64(file);
      const compressed = await compressPhotoIfNeeded(photoData);
      newPhoto = compressed;

      const preview = document.getElementById("new-photo-preview");
      const img = document.getElementById("new-photo-img");

      if (preview && img) {
        img.src = compressed;
        preview.classList.remove("hidden");
      }

      const removeBtn = document.getElementById("remove-new-photo-btn");
      if (removeBtn) {
        removeBtn.onclick = () => {
          newPhoto = null;
          preview.classList.add("hidden");
          btn.textContent = "🖼️ Вибрати з галереї";
        };
      }

      btn.textContent = "✅ Фото вибрано";
      console.log("✅ Фото з галереї завантажено");
    } catch (error) {
      console.error("❌ Помилка:", error);
      alert("❌ " + error.message);
      btn.textContent = "🖼️ Спробувати ще раз";
    } finally {
      btn.disabled = false;
      fileInput.value = "";
    }
  });
}

// Копіюйте ці helper функції з addPlace.js:
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Помилка читання файлу"));
    reader.readAsDataURL(file);
  });
}

async function compressPhotoIfNeeded(base64Data) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      let width = img.width;
      let height = img.height;

      if (width <= maxWidth && height <= maxHeight) {
        resolve(base64Data);
        return;
      }

      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      console.log(
        `✅ Стиснуто: ${img.width}x${img.height} → ${width}x${height}`
      );
      resolve(compressed);
    };

    img.onerror = () => reject(new Error("Помилка завантаження"));
    img.src = base64Data;
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
