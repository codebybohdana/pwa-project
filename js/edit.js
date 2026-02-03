/**
 * ========================================
 * EDIT PLACE MODULE
 * ========================================
 * Editing existing places
 */

// Global variables
let currentPlaceId = null;
let currentPlace = null;
let newPhoto = null;
let newCoordinates = null;

/**
 * Initialize edit page
 */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✏️ Initializing edit page...");

  try {
    await initDB();

    const urlParams = new URLSearchParams(window.location.search);
    currentPlaceId = urlParams.get("id");

    if (!currentPlaceId) {
      throw new Error("Place ID not found");
    }

    console.log("Editing place ID:", currentPlaceId);

    await loadPlaceForEditing(parseInt(currentPlaceId));

    setupEditForm();
    setupChangePhotoButton();
    setupChooseNewPhotoButton();
    setupUpdateLocationButton();
    setupNavigationButtons();
  } catch (error) {
    console.error("❌ Initialization error:", error);
    alert("Error: " + error.message);
    window.location.href = "../index.html";
  }
});

/**
 * Load place data for editing
 */
async function loadPlaceForEditing(id) {
  try {
    console.log("📖 Loading place for editing...");

    const place = await getPlaceById(id);

    if (!place) {
      throw new Error("Place not found");
    }

    currentPlace = place;
    console.log("Place loaded:", place);

    fillFormWithPlaceData(place);
  } catch (error) {
    console.error("❌ Loading error:", error);
    throw error;
  }
}

/**
 * Fill form with place data
 */
function fillFormWithPlaceData(place) {
  console.log("📝 Filling form...");

  // Name
  const nameInput = document.getElementById("place-name");
  if (nameInput) nameInput.value = place.name || "";

  // Address
  const addressInput = document.getElementById("place-address");
  if (addressInput) addressInput.value = place.address || "";

  // Notes
  const notesInput = document.getElementById("place-notes");
  if (notesInput) notesInput.value = place.notes || "";

  // Current photo
  const currentPhotoImg = document.getElementById("current-photo-img");
  if (currentPhotoImg) {
    currentPhotoImg.src = place.photo || "../images/placeholder.png";
    currentPhotoImg.onerror = function () {
      this.src = "../images/placeholder.png";
    };
  }

  // Current coordinates
  const currentCoordsGroup = document.getElementById("current-coords-group");
  const currentCoordsValue = document.getElementById(
    "current-coordinates-value"
  );
  const currentMapsBtn = document.getElementById("current-location-maps-btn");

  if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
    const formatted = formatCoordinates(
      place.coordinates.lat,
      place.coordinates.lng
    );

    if (currentCoordsValue) {
      currentCoordsValue.textContent = formatted;
    }

    if (currentCoordsGroup) {
      currentCoordsGroup.classList.remove("hidden");
    }

    if (currentMapsBtn) {
      const mapsUrl = `https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
      currentMapsBtn.href = mapsUrl;
      currentMapsBtn.style.display = "inline-flex";
    }
  } else {
    if (currentCoordsValue) {
      currentCoordsValue.textContent = "Coordinates not specified";
    }
    if (currentMapsBtn) {
      currentMapsBtn.style.display = "none";
    }
  }

  console.log("✅ Form filled");
}

/**
 * Setup edit form
 */
function setupEditForm() {
  const form = document.getElementById("edit-place-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleEditFormSubmit();
  });
}

/**
 * Handle form submission
 */
async function handleEditFormSubmit() {
  try {
    console.log("💾 Saving changes...");

    showLoading(true);

    const name = document.getElementById("place-name").value.trim();
    const address = document.getElementById("place-address").value.trim();
    const notes = document.getElementById("place-notes").value.trim();

    if (!name || !address) {
      throw new Error("Please fill in required fields");
    }

    const updatedPlace = {
      ...currentPlace,
      name,
      address,
      notes: notes || "",
    };

    if (newPhoto) {
      updatedPlace.photo = newPhoto;
      console.log("✅ Photo updated");
    }

    if (newCoordinates) {
      updatedPlace.coordinates = newCoordinates;
      console.log("✅ Coordinates updated");
    }

    updatedPlace.timestamp = Date.now();

    console.log("Updated data:", updatedPlace);

    await updatePlace(currentPlaceId, updatedPlace);

    console.log("✅ Changes saved");

    alert("✅ Changes saved successfully!");

    window.location.href = `place-details.html?id=${currentPlaceId}`;
  } catch (error) {
    console.error("❌ Save error:", error);
    alert("❌ " + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * Setup change photo button
 */
function setupChangePhotoButton() {
  const btn = document.getElementById("change-photo-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      console.log("📸 Changing photo...");

      btn.disabled = true;
      btn.textContent = "⏳ Opening camera...";

      const photoData = await takePhoto();
      newPhoto = photoData;

      const preview = document.getElementById("new-photo-preview");
      const img = document.getElementById("new-photo-img");

      if (preview && img) {
        img.src = photoData;
        preview.classList.remove("hidden");
      }

      const removeBtn = document.getElementById("remove-new-photo-btn");
      if (removeBtn) {
        removeBtn.onclick = () => {
          newPhoto = null;
          preview.classList.add("hidden");
          btn.textContent = "📸 Take New Photo";
        };
      }

      btn.textContent = "✅ New photo ready";

      console.log("✅ New photo saved");
    } catch (error) {
      console.error("❌ Camera error:", error);
      alert("❌ " + error.message);
      btn.textContent = "📸 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Setup choose new photo button
 */
function setupChooseNewPhotoButton() {
  const btn = document.getElementById("choose-new-photo-btn");
  const fileInput = document.getElementById("new-photo-file-input");

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
      newPhoto = compressed;

      const preview = document.getElementById("new-photo-preview");
      const img = document.getElementById("new-photo-img");

      if (preview && img) {
        img.src = compressed;
        preview.classList.remove("hidden");
      }

      const removeBtn = document.getElementById("remove-new-photo-btn");
      if (removeBtn) {
        removeBtn.onclick = () => {
          newPhoto = null;
          preview.classList.add("hidden");
          btn.textContent = "🖼️ Choose from Gallery";
        };
      }

      btn.textContent = "✅ Photo selected";
      console.log("✅ Photo from gallery loaded");
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ " + error.message);
      btn.textContent = "🖼️ Try again";
    } finally {
      btn.disabled = false;
      fileInput.value = "";
    }
  });
}

/**
 * Setup update location button
 */
function setupUpdateLocationButton() {
  const btn = document.getElementById("update-location-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      console.log("📍 Updating geolocation...");

      btn.disabled = true;
      btn.textContent = "⏳ Getting location...";

      const coords = await getCurrentPosition();
      newCoordinates = coords;

      const formatted = formatCoordinates(coords.lat, coords.lng);
      const display = document.getElementById("new-coordinates-display");
      const value = document.getElementById("new-coordinates-value");

      if (display && value) {
        value.textContent = formatted;
        display.classList.remove("hidden");
      }

      const previewBtn = document.getElementById("preview-new-location");
      if (previewBtn) {
        const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
        previewBtn.href = mapsUrl;
        previewBtn.style.display = "inline-flex";
      }

      btn.textContent = "✅ New location obtained";

      console.log("✅ New coordinates:", coords);
    } catch (error) {
      console.error("❌ Geolocation error:", error);
      alert("❌ " + error.message);
      btn.textContent = "📍 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

/**
 * Setup navigation buttons
 */
function setupNavigationButtons() {
  const backBtn = document.getElementById("back-button");
  if (backBtn) {
    backBtn.href = `place-details.html?id=${currentPlaceId}`;
  }

  const cancelBtn = document.getElementById("cancel-btn");
  if (cancelBtn) {
    cancelBtn.href = `place-details.html?id=${currentPlaceId}`;
  }
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    if (show) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }
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

console.log("✅ edit.js loaded");
