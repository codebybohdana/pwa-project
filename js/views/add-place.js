/**
 * views/add-place.js
 * Додавання місця.
 */

window.CityViews = window.CityViews || {};

window.CityViews.addPlace = async function () {
  let coords = null;
  let photoFull = null;
  let photoThumb = null;

  const form = $("add-place-form");
  const locBtn = $("get-location-btn");
  const takeBtn = $("take-photo-btn");
  const chooseBtn = $("choose-photo-btn");
  const fileInput = $("photo-file-input");

  const coordsBox = $("coordinates-display");
  const coordsValue = $("coordinates-value");
  const previewOnMap = $("preview-on-map");

  const preview = $("photo-preview");
  const previewImg = $("photo-preview-img");
  const removePhotoBtn = $("remove-photo-btn");

  function setPhoto(previewDataUrl) {
    previewImg.src = previewDataUrl;
    preview.classList.remove("hidden");
  }

  removePhotoBtn?.addEventListener("click", () => {
    photoFull = null;
    photoThumb = null;
    preview.classList.add("hidden");
  });

  locBtn?.addEventListener("click", async () => {
    try {
      locBtn.disabled = true;
      locBtn.textContent = "⏳ Getting location...";

      const pos = await getCurrentPosition();
      coords = pos;

      coordsValue.textContent = formatCoordinates(pos.lat, pos.lng);
      coordsBox.classList.remove("hidden");

      previewOnMap.href = `https://www.google.com/maps?q=${pos.lat},${pos.lng}`;
      previewOnMap.style.display = "inline-flex";

      locBtn.textContent = "✅ Location obtained";
    } catch (e) {
      showError(e.message);
      locBtn.textContent = "📍 Try again";
    } finally {
      locBtn.disabled = false;
    }
  });

  takeBtn?.addEventListener("click", async () => {
    try {
      takeBtn.disabled = true;
      takeBtn.textContent = "⏳ Opening camera...";

      const raw = await takePhoto();

      // ✅ Робимо дві версії: full + thumb (це сильно допомагає Performance)
      photoFull = await resizeImageDataUrl(raw, 1280, 1280, 0.82);
      photoThumb = await resizeImageDataUrl(raw, 480, 480, 0.72);

      setPhoto(photoFull);

      takeBtn.textContent = "✅ Photo captured";
    } catch (e) {
      showError(e.message);
      takeBtn.textContent = "📸 Try again";
    } finally {
      takeBtn.disabled = false;
    }
  });

  chooseBtn?.addEventListener("click", () => fileInput.click());

  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      chooseBtn.disabled = true;
      chooseBtn.textContent = "⏳ Loading...";

      if (!file.type.startsWith("image/"))
        throw new Error("Please select an image file.");
      if (file.size > 10 * 1024 * 1024)
        throw new Error("File too large. Max 10MB.");

      const raw = await fileToDataUrl(file);
      photoFull = await resizeImageDataUrl(raw, 1280, 1280, 0.82);
      photoThumb = await resizeImageDataUrl(raw, 480, 480, 0.72);

      setPhoto(photoFull);

      chooseBtn.textContent = "✅ Photo selected";
    } catch (err) {
      showError(err.message);
      chooseBtn.textContent = "🖼️ Try again";
    } finally {
      chooseBtn.disabled = false;
      fileInput.value = "";
    }
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      showLoading(true);

      const name = $("place-name").value.trim();
      const address = $("place-address").value.trim();
      const notes = $("place-notes").value.trim();

      if (!name || !address) throw new Error("Please fill required fields.");

      const data = {
        name,
        address,
        notes: notes || "",
        coordinates: coords,
        photo: photoFull || "",
        photoThumb: photoThumb || "",
      };

      await addPlace(data);

      showSuccess("Place saved!");
      window.location.href = "/index.html";
    } catch (err) {
      showError(err.message || "Failed to save.");
    } finally {
      showLoading(false);
    }
  });
};
