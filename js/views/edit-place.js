/**
 * views/edit-place.js
 * Редагування місця.
 */

window.CityViews = window.CityViews || {};

window.CityViews.editPlace = async function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    showError("ID not found.");
    window.location.href = "/index.html";
    return;
  }

  const place = await getPlaceById(id);
  if (!place) {
    showError("Place not found.");
    window.location.href = "/index.html";
    return;
  }

  // Заповнюємо форму
  $("place-name").value = place.name || "";
  $("place-address").value = place.address || "";
  $("place-notes").value = place.notes || "";

  const currentPhotoImg = $("current-photo-img");
  currentPhotoImg.src =
    place.photo || place.photoThumb || "/images/placeholder.png";
  currentPhotoImg.onerror = () =>
    (currentPhotoImg.src = "/images/placeholder.png");

  // Координати
  const currentCoordsValue = $("current-coordinates-value");
  const currentMapsBtn = $("current-location-maps-btn");

  if (place.coordinates?.lat && place.coordinates?.lng) {
    const { lat, lng } = place.coordinates;
    currentCoordsValue.textContent = formatCoordinates(lat, lng);

    currentMapsBtn.href = `https://www.google.com/maps?q=${lat},${lng}`;
    currentMapsBtn.style.display = "inline-flex";
  } else {
    $("current-coords-group").classList.add("hidden");
  }

  // Back/Cancel links
  $("back-button").href = `/pages/place-details.html?id=${id}`;
  $("cancel-btn").href = `/pages/place-details.html?id=${id}`;

  // Нові дані
  let newCoords = null;
  let newPhotoFull = null;
  let newPhotoThumb = null;

  const newPreview = $("new-photo-preview");
  const newImg = $("new-photo-img");

  $("remove-new-photo-btn").addEventListener("click", () => {
    newPhotoFull = null;
    newPhotoThumb = null;
    newPreview.classList.add("hidden");
  });

  $("change-photo-btn").addEventListener("click", async () => {
    try {
      $("change-photo-btn").disabled = true;
      $("change-photo-btn").textContent = "⏳ Opening camera...";

      const raw = await takePhoto();
      newPhotoFull = await resizeImageDataUrl(raw, 1280, 1280, 0.82);
      newPhotoThumb = await resizeImageDataUrl(raw, 480, 480, 0.72);

      newImg.src = newPhotoFull;
      newPreview.classList.remove("hidden");

      $("change-photo-btn").textContent = "✅ New photo ready";
    } catch (e) {
      showError(e.message);
      $("change-photo-btn").textContent = "📸 Try again";
    } finally {
      $("change-photo-btn").disabled = false;
    }
  });

  $("choose-new-photo-btn").addEventListener("click", () =>
    $("new-photo-file-input").click()
  );

  $("new-photo-file-input").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      $("choose-new-photo-btn").disabled = true;
      $("choose-new-photo-btn").textContent = "⏳ Loading...";

      const raw = await fileToDataUrl(file);
      newPhotoFull = await resizeImageDataUrl(raw, 1280, 1280, 0.82);
      newPhotoThumb = await resizeImageDataUrl(raw, 480, 480, 0.72);

      newImg.src = newPhotoFull;
      newPreview.classList.remove("hidden");

      $("choose-new-photo-btn").textContent = "✅ Photo selected";
    } catch (err) {
      showError(err.message);
      $("choose-new-photo-btn").textContent = "🖼️ Try again";
    } finally {
      $("choose-new-photo-btn").disabled = false;
      $("new-photo-file-input").value = "";
    }
  });

  $("update-location-btn").addEventListener("click", async () => {
    try {
      $("update-location-btn").disabled = true;
      $("update-location-btn").textContent = "⏳ Getting location...";

      newCoords = await getCurrentPosition();

      $("new-coordinates-value").textContent = formatCoordinates(
        newCoords.lat,
        newCoords.lng
      );
      $("new-coordinates-display").classList.remove("hidden");

      const link = $("preview-new-location");
      link.href = `https://www.google.com/maps?q=${newCoords.lat},${newCoords.lng}`;
      link.style.display = "inline-flex";

      $("update-location-btn").textContent = "✅ New location obtained";
    } catch (e) {
      showError(e.message);
      $("update-location-btn").textContent = "📍 Try again";
    } finally {
      $("update-location-btn").disabled = false;
    }
  });

  // submit
  $("edit-place-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      showLoading(true);

      const name = $("place-name").value.trim();
      const address = $("place-address").value.trim();
      const notes = $("place-notes").value.trim();

      if (!name || !address) throw new Error("Please fill required fields.");

      const updated = {
        ...place,
        name,
        address,
        notes: notes || "",
        coordinates: newCoords || place.coordinates || null,
        photo: newPhotoFull || place.photo || "",
        photoThumb: newPhotoThumb || place.photoThumb || "",
      };

      await updatePlace(id, updated);

      showSuccess("Changes saved!");
      window.location.href = `/pages/place-details.html?id=${id}`;
    } catch (err) {
      showError(err.message || "Failed to save.");
    } finally {
      showLoading(false);
    }
  });
};
