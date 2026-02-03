/**
 * INDEX PAGE - Home page
 */

async function initIndexPage() {
  try {
    await loadAndDisplayPlaces();
    setupSearch();
  } catch (error) {
    console.error("❌ [initIndexPage]", error?.message ?? error, error);
    showError("Failed to load places");
  }
}

async function loadAndDisplayPlaces() {
  try {
    const places = await getAllPlaces();
    displayPlaces(places);
  } catch (error) {
    console.error("❌ [loadAndDisplayPlaces]", error?.message ?? error, error);
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
}

function createPlaceCard(place) {
  const card = document.createElement("div");
  card.className = "place-card";
  card.setAttribute("role", "listitem");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `Place: ${escapeHtml(place.name)}`);
  card.onclick = () => goToPlaceDetails(place.id);
  card.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToPlaceDetails(place.id);
    }
  };

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
    <img src="images/placeholder.png" alt="${escapeHtml(
    place.name
  )}" class="place-card-image" loading="lazy" onerror="this.src='images/placeholder.png'">
    <div class="place-card-content">
      <h3 class="place-card-title">${escapeHtml(place.name)}</h3>
      <p class="place-card-address">${escapeHtml(place.address)}</p>
      <p class="place-card-meta">📅 ${dateStr}</p>
    </div>
  `;

  // Асинхронно завантажуємо зображення з Cache API або використовуємо base64
  const img = card.querySelector(".place-card-image");
  if (place.photo) {
    getImageUrl(place.photo).then((url) => {
      if (url) {
        img.src = url;
      } else {
        img.src = "images/placeholder.png";
      }
    }).catch((err) => {
      console.error("❌ [createPlaceCard] getImageUrl failed:", place.id, err?.message ?? err);
      img.src = "images/placeholder.png";
    });
  }

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
      try {
        const results = await searchPlaces(query);
        displayPlaces(results);
      } catch (error) {
        console.error("❌ [search]", query, error?.message ?? error, error);
      }
    }, 300);
  });
}

