/**
 * ========================================
 * ADD PLACE PAGE - Додавання місця
 * ========================================
 */

// Глобальні змінні для форми
let currentPhoto = null;
let currentCoordinates = null;

/**
 * Ініціалізація сторінки додавання
 */
async function initAddPlacePage() {
  console.log("📝 Ініціалізація сторінки додавання...");

  try {
    setupAddPlaceForm();
    setupLocationButton();
    setupCameraButton();
    setupChoosePhotoButton();
  } catch (error) {
    console.error("❌ Помилка:", error);
    showError("Помилка завантаження форми");
  }
}

/**
 * Налаштувати форму
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
    console.log("💾 Збереження...");
    showLoading(true);

    const name = document.getElementById("place-name").value.trim();
    const address = document.getElementById("place-address").value.trim();
    const notes = document.getElementById("place-notes").value.trim();

    if (!name || !address) {
      throw new Error("Заповніть обов'язкові поля");
    }

    const placeData = {
      name,
      address,
      notes: notes || "",
      photo: currentPhoto || "",
      coordinates: currentCoordinates || null,
      timestamp: Date.now(),
    };

    const id = await addPlace(placeData);
    console.log("✅ Збережено з ID:", id);

    showSuccess("Місце успішно збережено!");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (error) {
    console.error("❌ Помилка:", error);
    showError(error.message || "Не вдалося зберегти");
  } finally {
    showLoading(false);
  }
}

/**
 * Налаштувати кнопку геолокації
 */
function setupLocationButton() {
  const btn = document.getElementById("get-location-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      btn.textContent = "⏳ Отримання...";

      const coords = await getCurrentPosition();
      currentCoordinates = coords;

      const formatted = formatCoordinates(coords.lat, coords.lng);
      const display = document.getElementById("coordinates-display");
      const value = document.getElementById("coordinates-value");

      if (display && value) {
        value.textContent = formatted;
        display.classList.remove("hidden");
      }

      const previewBtn = document.getElementById("preview-on-map");
      if (previewBtn) {
        previewBtn.href = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
        previewBtn.style.display = "inline-flex";
      }

      btn.textContent = "✅ Локація отримана";
      btn.classList.add("button-success");
    } catch (error) {
      console.error("❌ Помилка:", error);
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
/**
 * Налаштувати кнопку камери
 */
function setupCameraButton() {
  const btn = document.getElementById("take-photo-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      btn.textContent = "⏳ Відкриття камери...";

      const photoData = await takePhoto();
      currentPhoto = photoData;

      showPhotoPreview(photoData);

      btn.textContent = "✅ Фото зроблено";
      btn.classList.add("button-success");
    } catch (error) {
      console.error("❌ Помилка:", error);
      showError(error.message);
      btn.textContent = "📸 Спробувати ще раз";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Налаштувати кнопку вибору з галереї
 */
function setupChoosePhotoButton() {
  const btn = document.getElementById("choose-photo-btn");
  const fileInput = document.getElementById("photo-file-input");

  if (!btn || !fileInput) return;

  // Натискання на кнопку відкриває file picker
  btn.addEventListener("click", () => {
    fileInput.click();
  });

  // Обробка вибраного файлу
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      btn.disabled = true;
      btn.textContent = "⏳ Завантаження...";

      // Перевірити тип файлу
      if (!file.type.startsWith("image/")) {
        throw new Error("Будь ласка, виберіть файл зображення");
      }

      // Перевірити розмір (макс 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Файл занадто великий. Максимум 10MB");
      }

      // Конвертувати в base64
      const photoData = await fileToBase64(file);

      // Стиснути якщо потрібно
      const compressed = await compressPhotoIfNeeded(photoData);
      currentPhoto = compressed;

      showPhotoPreview(compressed);

      btn.textContent = "✅ Фото вибрано";
      btn.classList.add("button-success");

      console.log("✅ Фото з галереї завантажено");
    } catch (error) {
      console.error("❌ Помилка:", error);
      showError(error.message);
      btn.textContent = "🖼️ Спробувати ще раз";
    } finally {
      btn.disabled = false;
      // Очистити input щоб можна було вибрати той самий файл знову
      fileInput.value = "";
    }
  });
}

/**
 * Показати превью фото
 */
function showPhotoPreview(photoData) {
  const preview = document.getElementById("photo-preview");
  const img = document.getElementById("photo-preview-img");

  if (preview && img) {
    img.src = photoData;
    preview.classList.remove("hidden");
  }

  // Налаштувати кнопку видалення
  const removeBtn = document.getElementById("remove-photo-btn");
  const cameraBtn = document.getElementById("take-photo-btn");
  const chooseBtn = document.getElementById("choose-photo-btn");

  if (removeBtn) {
    removeBtn.onclick = () => {
      currentPhoto = null;
      preview.classList.add("hidden");

      // Скинути кнопки
      if (cameraBtn) {
        cameraBtn.textContent = "📸 Зробити фото";
        cameraBtn.classList.remove("button-success");
      }
      if (chooseBtn) {
        chooseBtn.textContent = "🖼️ Вибрати з галереї";
        chooseBtn.classList.remove("button-success");
      }
    };
  }
}

/**
 * Конвертувати File в base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Помилка читання файлу"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Стиснути фото якщо потрібно
 */
async function compressPhotoIfNeeded(base64Data) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;

      let width = img.width;
      let height = img.height;

      // Якщо фото менше ніж ліміт — не стискати
      if (width <= maxWidth && height <= maxHeight) {
        resolve(base64Data);
        return;
      }

      // Обчислити нові розміри
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);

      // Створити canvas і стиснути
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.8);

      console.log(
        `✅ Фото стиснуто: ${img.width}x${img.height} → ${width}x${height}`
      );
      resolve(compressed);
    };

    img.onerror = () => {
      reject(new Error("Помилка завантаження зображення"));
    };

    img.src = base64Data;
  });
}

console.log("✅ addPlace.js завантажено");
