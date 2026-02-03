async function initIndexPage() {
  await loadAndRender();
  setupSearch();
}

async function loadAndRender() {
  const places = await getAllPlaces();
  renderPlaces(places);
}

function renderPlaces(places) {
  const list = $("places-list");
  const empty = $("empty-state");

  if (!list) return;

  list.innerHTML = "";

  if (!places.length) {
    list.classList.add("hidden");
    empty && empty.classList.remove("hidden");
    return;
  }

  list.classList.remove("hidden");
  empty && empty.classList.add("hidden");

  for (const p of places) {
    const card = document.createElement("div");
    card.className = "place-card";
    card.onclick = () =>
      (window.location.href = `./pages/place-details.html?id=${p.id}`);

    const photo = p.photo ? p.photo : "./images/placeholder.png";
    const dateStr = p.timestamp ? new Date(p.timestamp).toLocaleString() : "";

    card.innerHTML = `
      <img class="place-card-image" src="${photo}" alt="${escapeHtml(
      p.name
    )}" onerror="this.src='./images/placeholder.png'">
      <div class="place-card-content">
        <div class="place-card-title">${escapeHtml(p.name)}</div>
        <div class="place-card-address">${escapeHtml(p.address)}</div>
        <div class="place-card-meta">📅 ${escapeHtml(dateStr)}</div>
      </div>
    `;
    list.appendChild(card);
  }
}

function setupSearch() {
  const input = $("search-input");
  if (!input) return;

  let t = null;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(async () => {
      const q = input.value;
      const results = await searchPlaces(q);
      renderPlaces(results);
    }, 250);
  });
}
