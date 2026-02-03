/**
 * IMAGE CACHE MODULE (Cache API)
 * Зберігає зображення в Cache API замість base64 в IndexedDB
 */

const IMAGE_CACHE_NAME = "city-assistant-images-v1";

/**
 * Конвертує base64 зображення в Blob
 */
function base64ToBlob(base64, mimeType = "image/jpeg") {
  // Визначаємо MIME тип з base64 рядка, якщо він присутній
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  const detectedMimeType = base64.match(/data:([^;]+);/);
  const finalMimeType = detectedMimeType ? detectedMimeType[1] : mimeType;
  
  const byteString = atob(base64Data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: finalMimeType });
}

/**
 * Зберігає зображення в Cache API та повертає URL
 */
async function saveImageToCache(imageData, imageId) {
  try {
    // Створюємо унікальний ID для зображення
    const id = imageId || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Використовуємо абсолютний шлях від кореня для універсальності
    const imageUrl = `/cached-images/${id}`;

    // Конвертуємо base64 в Blob
    const blob = base64ToBlob(imageData);
    const response = new Response(blob, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    // Відкриваємо кеш та зберігаємо зображення
    const cache = await caches.open(IMAGE_CACHE_NAME);
    await cache.put(imageUrl, response);
    return imageUrl;
  } catch (error) {
    console.error("❌ [saveImageToCache]", error?.message ?? error, error);
    throw error;
  }
}

/**
 * Отримує зображення з Cache API
 */
async function getImageFromCache(imageUrl) {
  try {
  if (!imageUrl || !imageUrl.includes("/cached-images/")) {
    return null;
  }

    // Створюємо Request для пошуку в кеші
    const request = new Request(imageUrl);
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    }

    return null;
  } catch (error) {
    console.error("❌ [getImageFromCache]", error?.message ?? error, error);
    return null;
  }
}

/**
 * Видаляє зображення з Cache API
 */
async function deleteImageFromCache(imageUrl) {
  try {
    if (!imageUrl || !imageUrl.includes("/cached-images/")) {
      return;
    }

    const request = new Request(imageUrl);
    const cache = await caches.open(IMAGE_CACHE_NAME);
    await cache.delete(request);
  } catch (error) {
    console.error("❌ [deleteImageFromCache]", error?.message ?? error, error);
  }
}

/**
 * Отримує URL для відображення зображення
 * Підтримує як старі base64 URL, так і нові Cache API URL
 */
async function getImageUrl(photoData) {
  if (!photoData || typeof photoData !== "string") {
    return null;
  }

  // Якщо це вже URL (з Cache API або зовнішнє)
  if (photoData.includes("/cached-images/")) {
    const cachedUrl = await getImageFromCache(photoData);
    return cachedUrl || photoData;
  }

  // Якщо це base64 (старий формат)
  if (photoData.startsWith("data:image")) {
    return photoData;
  }

  // Якщо порожнє або null
  return null;
}

/**
 * Обробляє зображення перед збереженням
 * Конвертує base64 в Cache API URL
 */
async function processImageForSave(imageData) {
  if (!imageData || typeof imageData !== "string") {
    return "";
  }

  // Якщо це вже Cache API URL, повертаємо як є
  if (imageData.includes("/cached-images/")) {
    return imageData;
  }

  // Якщо це base64, зберігаємо в Cache API
  if (imageData.startsWith("data:image")) {
    return await saveImageToCache(imageData);
  }

  return "";
}

