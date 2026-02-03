/**
 * ========================================
 * INDEX PAGE - Головна сторінка
 * ========================================
 */

/**
 * Ініціалізація головної сторінки
 */
async function initIndexPage() {
  console.log("📱 Ініціалізація головної сторінки...");

  try {
    await loadAndDisplayPlaces();
    setupSearch();
  } catch (error) {
    console.error("❌ Помилка:", error);
    showError("Не вдалося завантажити місця");
  }
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
    console.error("❌ Помилка завантаження:", error);
    throw error;
  }
}

/**
 * Відобразити місця на сторінці
 */
function displayPlaces(places) {
  const placesList = document.getElementById("places-list");
  const emptyState = document.getElementById("empty-state");

  if (!placesList) return;

  placesList.innerHTML = "";

  if (places.length === 0) {
    placesList.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  placesList.classList.remove("hidden");
  if (emptyState) emptyState.classList.add("hidden");

  places.forEach((place) => {
    const card = createPlaceCard(place);
    placesList.appendChild(card);
  });

  console.log(`✅ Відображено місць: ${places.length}`);
}

/**
 * Створити картку місця
 */
function createPlaceCard(place) {
  const card = document.createElement("div");
  card.className = "place-card";
  card.onclick = () => goToPlaceDetails(place.id);

  const photoSrc = place.photo || "images/placeholder.png";

  let dateStr = "Дата не вказана";
  if (place.timestamp) {
    try {
      dateStr = new Date(place.timestamp).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      dateStr = new Date(place.timestamp).toLocaleDateString();
    }
  }

  card.innerHTML = `
      <img src="${photoSrc}" alt="${escapeHtml(
    place.name
  )}" class="place-card-image" onerror="this.src='images/placeholder.png'">
      <div class="place-card-content">
        <h3 class="place-card-title">${escapeHtml(place.name)}</h3>
        <p class="place-card-address">${escapeHtml(place.address)}</p>
        <p class="place-card-meta">📅 ${dateStr}</p>
      </div>
    `;

  return card;
}

/**
 * Перейти на сторінку деталей
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
    }, 300);
  });
}

console.log("✅ index.js завантажено");
