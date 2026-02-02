/**
 * ========================================
 * DATABASE MODULE (IndexedDB)
 * ========================================
 * Модуль для роботи з локальною базою даних
 * Зберігає місця офлайн на пристрої користувача
 */

// Конфігурація бази даних
const DB_NAME = "CityAssistantDB";
const DB_VERSION = 1;
const STORE_NAME = "places";

let db = null;

/**
 * Ініціалізація бази даних
 * @returns {Promise<IDBDatabase>}
 */
async function initDB() {
  return new Promise((resolve, reject) => {
    console.log("🔄 Ініціалізація бази даних...");

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Помилка відкриття БД
    request.onerror = () => {
      console.error("❌ Помилка відкриття бази даних:", request.error);
      reject(request.error);
    };

    // Успішне відкриття БД
    request.onsuccess = () => {
      db = request.result;
      console.log("✅ База даних успішно відкрита");
      resolve(db);
    };

    // Створення/оновлення структури БД
    request.onupgradeneeded = (event) => {
      console.log("🔧 Створення структури бази даних...");

      const database = event.target.result;

      // Створити object store якщо не існує
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        // Створити індекси для швидкого пошуку
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });

        console.log("✅ Object store створено");
      }
    };
  });
}

/**
 * Додати нове місце
 * @param {Object} placeData - Дані місця
 * @returns {Promise<number>} ID нового місця
 */
async function addPlace(placeData) {
  return new Promise((resolve, reject) => {
    console.log("📝 Додавання нового місця:", placeData.name);

    // Додати timestamp якщо немає
    if (!placeData.timestamp) {
      placeData.timestamp = Date.now();
    }

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.add(placeData);

    request.onsuccess = () => {
      console.log("✅ Місце додано з ID:", request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("❌ Помилка додавання місця:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Отримати всі місця
 * @returns {Promise<Array>} Масив всіх місць
 */
async function getAllPlaces() {
  return new Promise((resolve, reject) => {
    console.log("📖 Отримання всіх місць...");

    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const places = request.result;

      // Сортувати по timestamp (найновіші перші)
      places.sort((a, b) => b.timestamp - a.timestamp);

      console.log(`✅ Знайдено місць: ${places.length}`);
      resolve(places);
    };

    request.onerror = () => {
      console.error("❌ Помилка отримання місць:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Отримати місце по ID
 * @param {number} id - ID місця
 * @returns {Promise<Object>} Дані місця
 */
async function getPlaceById(id) {
  return new Promise((resolve, reject) => {
    console.log("🔍 Отримання місця з ID:", id);

    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(Number(id));

    request.onsuccess = () => {
      if (request.result) {
        console.log("✅ Місце знайдено:", request.result.name);
        resolve(request.result);
      } else {
        console.log("⚠️ Місце не знайдено");
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error("❌ Помилка отримання місця:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Оновити місце
 * @param {number} id - ID місця
 * @param {Object} placeData - Нові дані
 * @returns {Promise<void>}
 */
async function updatePlace(id, placeData) {
  return new Promise((resolve, reject) => {
    console.log("✏️ Оновлення місця з ID:", id);

    // Зберегти ID
    placeData.id = Number(id);

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(placeData);

    request.onsuccess = () => {
      console.log("✅ Місце оновлено");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Помилка оновлення місця:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Видалити місце
 * @param {number} id - ID місця
 * @returns {Promise<void>}
 */
async function deletePlace(id) {
  return new Promise((resolve, reject) => {
    console.log("🗑️ Видалення місця з ID:", id);

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(Number(id));

    request.onsuccess = () => {
      console.log("✅ Місце видалено");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Помилка видалення місця:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Пошук місць
 * @param {string} query - Пошуковий запит
 * @returns {Promise<Array>} Відфільтровані місця
 */
async function searchPlaces(query) {
  try {
    console.log("🔍 Пошук місць:", query);

    const allPlaces = await getAllPlaces();

    if (!query || query.trim() === "") {
      return allPlaces;
    }

    const searchTerm = query.toLowerCase().trim();

    const filtered = allPlaces.filter((place) => {
      const nameMatch = place.name.toLowerCase().includes(searchTerm);
      const addressMatch = place.address.toLowerCase().includes(searchTerm);
      const notesMatch =
        place.notes && place.notes.toLowerCase().includes(searchTerm);

      return nameMatch || addressMatch || notesMatch;
    });

    console.log(`✅ Знайдено результатів: ${filtered.length}`);
    return filtered;
  } catch (error) {
    console.error("❌ Помилка пошуку:", error);
    throw error;
  }
}

/**
 * Очистити всю базу даних (для тестування)
 * @returns {Promise<void>}
 */
async function clearAllPlaces() {
  return new Promise((resolve, reject) => {
    console.log("🗑️ Очищення всієї бази даних...");

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => {
      console.log("✅ База даних очищена");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Помилка очищення:", request.error);
      reject(request.error);
    };
  });
}

// Ініціалізувати БД при завантаженні скрипта
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initDB().catch((error) => {
      console.error("❌ Критична помилка ініціалізації БД:", error);
    });
  });
}

console.log("✅ Модуль db.js завантажено");
