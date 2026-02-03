let currentId = null;
let currentPlace = null;
let newPhoto = null;
let newCoords = null;

async function initEditPlacePage() {
  currentId = new URLSearchParams(window.location.search).get("id");
  if (!currentId) {
    showError("Place ID not found");
    window.location.href = "../index.html";
    return;
  }

  currentPlace = await getPlaceById(currentId);
  if (!currentPlace) {
    showError("Place not found");
    window.location.href = "../index.html";
    return;
  }

  fillForm(currentPlace);
  wireUI();
}

function wireUI() {
  $("back-button").href = `./place-details.html?id=${currentId}`;
  $("cancel-btn").href = `./place-details.html?id=${currentId}`;

  $("edit-place-form").addEventListener("submit", onSubmit);

  $("change-photo-btn").addEventListener("click", onTakeNewPhoto);
  $("choose-new-photo-btn").addEventListener("click", () =>
    $("new-photo-file-input").click()
  );
  $("new-photo-file-input").addEventListener("change", onPickNewPhoto);
  $("remove-new-photo-btn").addEventListener("click", () => {
    newPhoto = null;
    $("new-photo-preview").classList.add("hidden");
  });

  $("update-location-btn").addEventListener("click", onUpdateLocation);
}

function fillForm(p) {
  $("place-name").value = p.name || "";
  $("place-address").value = p.address || "";
  $("place-notes").value = p.notes || "";

  $("current-photo-img").src = p.photo || "../images/placeholder.png";
  $("current-photo-img").onerror = () =>
    ($("current-photo-img").src = "../images/placeholder.png");

  if (p.coordinates?.lat && p.coordinates?.lng) {
    $("current-coordinates-value").textContent = formatCoordinates(
      p.coordinates.lat,
      p.coordinates.lng
    );

    const link = $("current-location-maps-btn");
    link.href = `https://www.google.com/maps?q=${p.coordinates.lat},${p.coordinates.lng}`;
    link.hidden = false;
  } else {
    $("current-coordinates-value").textContent = "—";
    $("current-location-maps-btn").hidden = true;
  }
}

async function onSubmit(e) {
  e.preventDefault();
  try {
    showLoading(true, "Saving...");

    const name = $("place-name").value.trim();
    const address = $("place-address").value.trim();
    const notes = $("place-notes").value.trim();

    if (!name || !address) throw new Error("Fill required fields");

    const updated = {
      ...currentPlace,
      name,
      address,
      notes: notes || "",
      photo: newPhoto ? newPhoto : currentPlace.photo,
      coordinates: newCoords ? newCoords : currentPlace.coordinates,
      timestamp: Date.now(),
    };

    await updatePlace(currentId, updated);
    showSuccess("Saved!");
    window.location.href = `./place-details.html?id=${currentId}`;
  } catch (err) {
    showError(err.message || "Save failed");
  } finally {
    showLoading(false);
  }
}

async function onUpdateLocation() {
  const btn = $("update-location-btn");
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Getting location...";

    const coords = await getCurrentPosition();
    newCoords = coords;

    $("new-coordinates-value").textContent = formatCoordinates(
      coords.lat,
      coords.lng
    );
    $("new-coordinates-display").classList.remove("hidden");

    const link = $("preview-new-location");
    link.href = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    link.hidden = false;

    btn.textContent = "✅ New location obtained";
  } catch (e) {
    showError(e.message);
    btn.textContent = "📍 Try again";
  } finally {
    btn.disabled = false;
  }
}

async function onTakeNewPhoto() {
  const btn = $("change-photo-btn");
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Opening camera...";
    newPhoto = await takePhoto();
    $("new-photo-img").src = newPhoto;
    $("new-photo-preview").classList.remove("hidden");
    btn.textContent = "✅ New photo ready";
  } catch (e) {
    showError(e.message);
    btn.textContent = "📸 Try again";
  } finally {
    btn.disabled = false;
  }
}

async function onPickNewPhoto(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    if (!file.type.startsWith("image/")) throw new Error("Select image file");
    const base64 = await fileToBase64(file);
    newPhoto = base64;
    $("new-photo-img").src = newPhoto;
    $("new-photo-preview").classList.remove("hidden");
  } catch (err) {
    showError(err.message);
  } finally {
    e.target.value = "";
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("File read error"));
    r.readAsDataURL(file);
  });
}
