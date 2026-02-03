/**
 * ========================================
 * MAIN APP - ENTRY POINT
 * ========================================
 * Головний файл - тільки ініціалізація
 */

// Визначити поточну сторінку
const currentPath = window.location.pathname;

// Перевірки сторінки
function isIndexPage() {
  return (
    currentPath.endsWith("index.html") ||
    currentPath === "/" ||
    currentPath === ""
  );
}

function isAddPlacePage() {
  return currentPath.includes("add-place.html");
}

function isDetailsPage() {
  return currentPath.includes("place-details.html");
}

// Головна ініціалізація
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Запуск додатку...");

  try {
    // Ініціалізувати базу даних
    await initDB();

    // Ініціалізувати потрібну сторінку
    if (isIndexPage()) {
      await initIndexPage();
    } else if (isAddPlacePage()) {
      await initAddPlacePage();
    } else if (isDetailsPage()) {
      await initDetailsPage();
    }

    // Завжди оновлювати онлайн статус
    updateOnlineStatus();

    console.log("✅ Додаток ініціалізовано");
  } catch (error) {
    console.error("❌ Критична помилка:", error);
    showError("Помилка завантаження додатку");
  }
});

console.log("✅ app.js завантажено");
