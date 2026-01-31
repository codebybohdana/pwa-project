/**
 * ========================================
 * GEOLOCATION MODULE
 * ========================================
 * Модуль для роботи з геолокацією
 * Отримує GPS координати пристрою
 */

/**
 * Перевірити чи доступна геолокація
 * @returns {boolean}
 */
function isGeolocationAvailable() {
  return !!navigator.geolocation;
}

/**
 * Отримати поточну позицію
 * @returns {Promise<Object>} Координати {lat, lng, accuracy}
 */
async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    console.log("📍 Запит геолокації...");

    // Перевірити доступність
    if (!isGeolocationAvailable()) {
      reject(new Error("Геолокація не підтримується на цьому пристрої"));
      return;
    }

    // Опції
    const options = {
      enableHighAccuracy: true, // Висока точність
      timeout: 10000, // Таймаут 10 секунд
      maximumAge: 0, // Не використовувати кеш
    };

    // Отримати позицію
    navigator.geolocation.getCurrentPosition(
      // Success
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log("✅ Геолокація отримана:", coords);
        resolve(coords);
      },
      // Error
      (error) => {
        console.error("❌ Помилка геолокації:", error);

        // Обробка різних помилок
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Доступ до геолокації заборонено. Будь ласка, дозвольте доступ у налаштуваннях браузера."
            )
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(
            new Error(
              "Неможливо визначити позицію. Перевірте налаштування GPS."
            )
          );
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Час очікування вичерпано. Спробуйте ще раз."));
        } else {
          reject(new Error("Помилка отримання геолокації."));
        }
      },
      options
    );
  });
}

/**
 * Форматувати координати для відображення
 * @param {number} lat - Широта
 * @param {number} lng - Довгота
 * @returns {string} Форматована строка
 */
function formatCoordinates(lat, lng) {
  // Визначити напрямки
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";

  // Форматувати з 4 знаками після коми
  const formattedLat = Math.abs(lat).toFixed(4);
  const formattedLng = Math.abs(lng).toFixed(4);

  return `${formattedLat}° ${latDir}, ${formattedLng}° ${lngDir}`;
}

/**
 * Обчислити відстань між двома точками (в метрах)
 * Використовує формулу Haversine
 * @param {number} lat1 - Широта точки 1
 * @param {number} lng1 - Довгота точки 1
 * @param {number} lat2 - Широта точки 2
 * @param {number} lng2 - Довгота точки 2
 * @returns {number} Відстань в метрах
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Радіус Землі в метрах

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}

/**
 * Форматувати відстань для відображення
 * @param {number} meters - Відстань в метрах
 * @returns {string} Форматована строка
 */
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  } else {
    return `${(meters / 1000).toFixed(1)} км`;
  }
}

/**
 * Відстежувати позицію (continuous tracking)
 * @param {Function} callback - Функція яка викликається при зміні позиції
 * @returns {number} watchId - ID для зупинки відстеження
 */
function watchPosition(callback) {
  if (!isGeolocationAvailable()) {
    console.error("❌ Геолокація не доступна");
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      callback(coords);
    },
    (error) => {
      console.error("❌ Помилка відстеження:", error);
    },
    options
  );

  console.log("✅ Відстеження позиції розпочато");
  return watchId;
}

/**
 * Зупинити відстеження позиції
 * @param {number} watchId - ID з watchPosition()
 */
function stopWatching(watchId) {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    console.log("✅ Відстеження позиції зупинено");
  }
}

console.log("✅ Модуль geolocation.js завантажено");
