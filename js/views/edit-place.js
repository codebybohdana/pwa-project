/**
 * EDIT PLACE PAGE
 */

let currentPlaceId = null;
let currentPlace = null;
let newPhoto = null;
let newCoordinates = null;

async function initEditPage() {
  console.log("✏️ Initializing edit page...");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    currentPlaceId = urlParams.get("id");

    if (!currentPlaceId) {
      throw new Error("Place ID not found");
    }

    await loadPlaceForEditing(parseInt(currentPlaceId));

    setupEditForm();
    setupChangePhotoButton();
    setupChooseNewPhotoButton();
    setupUpdateLocationButton();
    setupNavigationButtons();
  } catch (error) {
    console.error("❌ Error:", error);
    alert("Error: " + error.message);
    window.location.href = "../index.html";
  }
}

async function loadPlaceForEditing(id) {
  try {
    const place = await getPlaceById(id);

    if (!place) {
      throw new Error("Place not found");
    }

    currentPlace = place;
    fillFormWithPlaceData(place);
  } catch (error) {
    console.error("❌ Loading error:", error);
    throw error;
  }
}

function fillFormWithPlaceData(place) {
  const nameInput = document.getElementById("place-name");
  if (nameInput) nameInput.value = place.name || "";

  const addressInput = document.getElementById("place-address");
  if (addressInput) addressInput.value = place.address || "";

  const notesInput = document.getElementById("place-notes");
  if (notesInput) notesInput.value = place.notes || "";

  const currentPhotoImg = document.getElementById("current-photo-img");
  if (currentPhotoImg) {
    currentPhotoImg.src = place.photo || "../images/placeholder.png";
    currentPhotoImg.onerror = function () {
      this.src = "../images/placeholder.png";
    };
  }

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
}

function setupEditForm() {
  const form = document.getElementById("edit-place-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleEditFormSubmit();
  });
}

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
    }

    if (newCoordinates) {
      updatedPlace.coordinates = newCoordinates;
    }

    updatedPlace.timestamp = Date.now();

    await updatePlace(currentPlaceId, updatedPlace);

    alert("✅ Changes saved successfully!");
    window.location.href = `place-details.html?id=${currentPlaceId}`;
  } catch (error) {
    console.error("❌ Error:", error);
    alert("❌ " + error.message);
  } finally {
    showLoading(false);
  }
}

function setupChangePhotoButton() {
  const btn = document.getElementById("change-photo-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
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
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ " + error.message);
      btn.textContent = "📸 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

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
      const compressed = await compressPhoto(photoData);
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

function setupUpdateLocationButton() {
  const btn = document.getElementById("update-location-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
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
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ " + error.message);
      btn.textContent = "📍 Try again";
    } finally {
      btn.disabled = false;
    }
  });
}

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

console.log("✅ edit-place.js loaded");
