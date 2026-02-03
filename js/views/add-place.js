/**
 * ADD PLACE PAGE
 */

let currentPhoto = null;
let currentCoordinates = null;

async function initAddPlacePage() {
  try {
    setupAddPlaceForm();
    setupLocationButton();
    setupCameraButton();
    setupChoosePhotoButton();
  } catch (error) {
    console.error("❌ [initAddPlacePage]", error?.message ?? error, error);
    showError("Failed to load form");
  }
}

function setupAddPlaceForm() {
  const form = document.getElementById("add-place-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });
}

async function handleFormSubmit() {
  try {
    showLoading(true);

    const name = document.getElementById("place-name").value.trim();
    const address = document.getElementById("place-address").value.trim();
    const notes = document.getElementById("place-notes").value.trim();

    if (!name || !address) {
      throw new Error("Please fill in required fields");
    }

    // Обробляємо зображення через Cache API
    let photoUrl = "";
    if (currentPhoto) {
      photoUrl = await processImageForSave(currentPhoto);
    }

    const placeData = {
      name,
      address,
      notes: notes || "",
      photo: photoUrl,
      coordinates: currentCoordinates || null,
      timestamp: Date.now(),
    };

    await addPlace(placeData);
    showSuccess("Place saved successfully!");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (error) {
    console.error("❌ [handleFormSubmit]", error?.message ?? error, error);
    showError(error?.message || "Failed to save");
  } finally {
    showLoading(false);
  }
}

function setupLocationButton() {
  const btn = document.getElementById("get-location-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      btn.textContent = "⏳ Getting location...";

      const coords = await getCurrentPosition();
      currentCoordinates = coords;

      const formatted = formatCoordinates(coords.lat, coords.lng);
      const display = document.getElementById("coordinates-display");
      const value = document.getElementById("coordinates-value");

      if (display && value) {
        value.textContent = formatted;
        display.classList.remove("hidden");
      }

      const previewBtn = document.getElementById("preview-on-map");
      if (previewBtn) {
        previewBtn.href = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
        previewBtn.style.display = "inline-flex";
      }

      btn.textContent = "✅ Location obtained";
      btn.classList.add("button-success");
    } catch (error) {
      console.error("❌ [get-location]", error?.message ?? error, error);
      showError(error?.message ?? "Location failed");
      btn.textContent = "📍 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

function setupCameraButton() {
  const btn = document.getElementById("take-photo-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      btn.textContent = "⏳ Opening camera...";

      const photoData = await takePhoto();
      currentPhoto = photoData;

      showPhotoPreview(photoData);

      btn.textContent = "✅ Photo taken";
      btn.classList.add("button-success");
    } catch (error) {
      console.error("❌ [take-photo]", error?.message ?? error, error);
      showError(error?.message ?? "Camera failed");
      btn.textContent = "📸 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

function setupChoosePhotoButton() {
  const btn = document.getElementById("choose-photo-btn");
  const fileInput = document.getElementById("photo-file-input");

  if (!btn || !fileInput) return;

  btn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      btn.disabled = true;
      btn.textContent = "⏳ Loading...";

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File too large. Maximum 10MB");
      }

      const photoData = await fileToBase64(file);
      const compressed = await compressPhoto(photoData);
      currentPhoto = compressed;

      showPhotoPreview(compressed);

      btn.textContent = "✅ Photo selected";
      btn.classList.add("button-success");
    } catch (error) {
      console.error("❌ [choose-photo]", error?.message ?? error, error);
      showError(error?.message ?? "Photo load failed");
      btn.textContent = "🖼️ Try again";
    } finally {
      btn.disabled = false;
      fileInput.value = "";
    }
  });
}

function showPhotoPreview(photoData) {
  const preview = document.getElementById("photo-preview");
  const img = document.getElementById("photo-preview-img");

  if (preview && img) {
    img.src = photoData;
    preview.classList.remove("hidden");
  }

  const removeBtn = document.getElementById("remove-photo-btn");
  const cameraBtn = document.getElementById("take-photo-btn");
  const chooseBtn = document.getElementById("choose-photo-btn");

  if (removeBtn) {
    removeBtn.onclick = () => {
      currentPhoto = null;
      preview.classList.add("hidden");

      if (cameraBtn) {
        cameraBtn.textContent = "📸 Take Photo";
        cameraBtn.classList.remove("button-success");
      }
      if (chooseBtn) {
        chooseBtn.textContent = "🖼️ Choose from Gallery";
        chooseBtn.classList.remove("button-success");
      }
    };
  }
}

