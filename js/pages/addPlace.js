/**
 * ========================================
 * ADD PLACE PAGE - Adding new places
 * ========================================
 */

// Global variables for form
let currentPhoto = null;
let currentCoordinates = null;

/**
 * Initialize add place page
 */
async function initAddPlacePage() {
  console.log("📝 Initializing add place page...");

  try {
    setupAddPlaceForm();
    setupLocationButton();
    setupCameraButton();
    setupChoosePhotoButton();
  } catch (error) {
    console.error("❌ Error:", error);
    showError("Failed to load form");
  }
}

/**
 * Setup add place form
 */
function setupAddPlaceForm() {
  const form = document.getElementById("add-place-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });
}

/**
 * Handle form submission
 */
async function handleFormSubmit() {
  try {
    console.log("💾 Saving...");
    showLoading(true);

    const name = document.getElementById("place-name").value.trim();
    const address = document.getElementById("place-address").value.trim();
    const notes = document.getElementById("place-notes").value.trim();

    if (!name || !address) {
      throw new Error("Please fill in required fields");
    }

    const placeData = {
      name,
      address,
      notes: notes || "",
      photo: currentPhoto || "",
      coordinates: currentCoordinates || null,
      timestamp: Date.now(),
    };

    const id = await addPlace(placeData);
    console.log("✅ Saved with ID:", id);

    showSuccess("Place saved successfully!");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (error) {
    console.error("❌ Error:", error);
    showError(error.message || "Failed to save place");
  } finally {
    showLoading(false);
  }
}

/**
 * Setup location button
 */
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

      console.log("✅ Coordinates:", coords);
    } catch (error) {
      console.error("❌ Error:", error);
      showError(error.message);
      btn.textContent = "📍 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Setup camera button
 */
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

      console.log("✅ Photo saved");
    } catch (error) {
      console.error("❌ Error:", error);
      showError(error.message);
      btn.textContent = "📸 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Setup choose photo button
 */
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
      const compressed = await compressPhotoIfNeeded(photoData);
      currentPhoto = compressed;

      showPhotoPreview(compressed);

      btn.textContent = "✅ Photo selected";
      btn.classList.add("button-success");

      console.log("✅ Photo from gallery loaded");
    } catch (error) {
      console.error("❌ Error:", error);
      showError(error.message);
      btn.textContent = "🖼️ Try again";
    } finally {
      btn.disabled = false;
      fileInput.value = "";
    }
  });
}

/**
 * Show photo preview
 */
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

/**
 * Convert File to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress photo if needed
 */
async function compressPhotoIfNeeded(base64Data) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const maxWidth = 1920;
      const maxHeight = 1080;
      let width = img.width;
      let height = img.height;

      if (width <= maxWidth && height <= maxHeight) {
        resolve(base64Data);
        return;
      }

      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      console.log(
        `✅ Compressed: ${img.width}x${img.height} → ${width}x${height}`
      );
      resolve(compressed);
    };

    img.onerror = () => reject(new Error("Image load error"));
    img.src = base64Data;
  });
}

console.log("✅ addPlace.js loaded");
