// js/camera.js
/**
 * ========================================
 * CAMERA MODULE
 * ========================================
 * Модуль для роботи з камерою пристрою
 * Дозволяє робити фото і зберігати їх як base64
 */

/**
 * Перевірити чи доступна камера
 * @returns {boolean}
 */
function isCameraAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Зробити фото через камеру
 * @returns {Promise<string>} base64 строка фото
 */
async function takePhoto() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("📸 Запит доступу до камери...");

      // Перевірити доступність камери
      if (!isCameraAvailable()) {
        throw new Error("Камера не підтримується на цьому пристрої");
      }

      // Запросити доступ до камери
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Задня камера на мобільних
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      console.log("✅ Доступ до камери отримано");

      // Створити video елемент (прихований)
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true"); // iOS
      video.style.display = "none";
      document.body.appendChild(video);

      // Почекати поки відео готове
      await video.play();

      // Почекати трошки щоб камера прогрілась
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Створити canvas для знімку
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Намалювати кадр на canvas
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Конвертувати в base64 (JPEG, якість 80%)
      const photoData = canvas.toDataURL("image/jpeg", 0.8);

      console.log("✅ Фото зроблено");

      // Зупинити камеру
      stream.getTracks().forEach((track) => track.stop());

      // Видалити video елемент
      video.remove();

      resolve(photoData);
    } catch (error) {
      console.error("❌ Помилка камери:", error);

      // Обробка різних помилок
      if (error.name === "NotAllowedError") {
        reject(
          new Error(
            "Доступ до камери заборонено. Будь ласка, дозвольте доступ у налаштуваннях браузера."
          )
        );
      } else if (error.name === "NotFoundError") {
        reject(new Error("Камера не знайдена на цьому пристрої."));
      } else if (error.name === "NotReadableError") {
        reject(new Error("Камера вже використовується іншим додатком."));
      } else {
        reject(error);
      }
    }
  });
}

/**
 * Показати превью фото
 * @param {string} base64Data - base64 строка фото
 * @param {HTMLElement} container - Контейнер для відображення
 */
function displayPhotoPreview(base64Data, container) {
  if (!container) {
    console.error("❌ Контейнер не знайдено");
    return;
  }

  // Очистити контейнер
  container.innerHTML = "";

  // Створити img елемент
  const img = document.createElement("img");
  img.src = base64Data;
  img.alt = "Photo preview";
  img.style.width = "100%";
  img.style.height = "auto";
  img.style.borderRadius = "8px";

  // Додати до контейнера
  container.appendChild(img);

  console.log("✅ Превью відображено");
}

/**
 * Стиснути фото (якщо занадто велике)
 * @param {string} base64Data - Оригінальне фото
 * @param {number} maxWidth - Максимальна ширина
 * @param {number} maxHeight - Максимальна висота
 * @returns {Promise<string>} Стиснуте фото
 */
async function compressPhoto(base64Data, maxWidth = 1920, maxHeight = 1080) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Обчислити нові розміри зберігаючи пропорції
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Створити canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Намалювати зменшене фото
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертувати в base64
        const compressed = canvas.toDataURL("image/jpeg", 0.8);

        console.log(
          `✅ Фото стиснуто: ${img.width}x${img.height} → ${width}x${height}`
        );
        resolve(compressed);
      };

      img.onerror = () => {
        reject(new Error("Помилка завантаження фото"));
      };

      img.src = base64Data;
    } catch (error) {
      console.error("❌ Помилка стиснення фото:", error);
      reject(error);
    }
  });
}

console.log("✅ Модуль camera.js завантажено");
