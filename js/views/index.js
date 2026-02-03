/**
 * INDEX PAGE - Home page
 */

async function initIndexPage() {
  console.log("📱 Initializing index page...");

  try {
    await loadAndDisplayPlaces();
    setupSearch();
  } catch (error) {
    console.error("❌ Error:", error);
    showError("Failed to load places");
  }
}

async function loadAndDisplayPlaces() {
  try {
    console.log("📍 Loading places...");
    const places = await getAllPlaces();
    displayPlaces(places);
  } catch (error) {
    console.error("❌ Loading error:", error);
    throw error;
  }
}

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

  console.log(`✅ Displayed ${places.length} places`);
}

function createPlaceCard(place) {
  const card = document.createElement("div");
  card.className = "place-card";
  card.onclick = () => goToPlaceDetails(place.id);

  const photoSrc = place.photo || "images/placeholder.png";

  let dateStr = "Date not specified";
  if (place.timestamp) {
    try {
      dateStr = new Date(place.timestamp).toLocaleDateString("en-US", {
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

function goToPlaceDetails(id) {
  window.location.href = `pages/place-details.html?id=${id}`;
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const query = e.target.value;
      console.log("🔍 Search:", query);

      try {
        const results = await searchPlaces(query);
        displayPlaces(results);
      } catch (error) {
        console.error("❌ Search error:", error);
      }
    }, 300);
  });
}

console.log("✅ index.js loaded");
