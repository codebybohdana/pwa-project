/**
 * views/add-place.js — add place form
 */

(function () {
  "use strict";

  let currentPhoto = null;
  let currentCoordinates = null;

  function showPhotoPreview(base64) {
    const preview = document.getElementById("photo-preview");
    const img = document.getElementById("photo-preview-img");
    if (preview && img) {
      img.src = base64;
      preview.classList.remove("hidden");
    }

    const removeBtn = document.getElementById("remove-photo-btn");
    const cameraBtn = document.getElementById("take-photo-btn");
    const chooseBtn = document.getElementById("choose-photo-btn");

    if (removeBtn) {
      removeBtn.onclick = () => {
        currentPhoto = null;
        preview?.classList.add("hidden");
        if (cameraBtn) cameraBtn.textContent = "📸 Take Photo";
        if (chooseBtn) chooseBtn.textContent = "🖼️ Choose from Gallery";
      };
    }
  }

  function setupAddPlaceForm() {
    const form = document.getElementById("add-place-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        window.CityUtils.showLoading(true);

        const name = document.getElementById("place-name").value.trim();
        const address = document.getElementById("place-address").value.trim();
        const notes = document.getElementById("place-notes").value.trim();

        if (!name || !address)
          throw new Error("Please fill in required fields");

        let photoUrl = "";
        if (currentPhoto)
          photoUrl = await window.CityImages.processImageForSave(currentPhoto);

        const data = {
          name,
          address,
          notes: notes || "",
          photo: photoUrl,
          coordinates: currentCoordinates || null,
          timestamp: Date.now(),
        };

        await window.CityDB.addPlace(data);
        window.CityUtils.showSuccess("Place saved successfully!");

        setTimeout(() => (window.location.href = "../index.html"), 700);
      } catch (e2) {
        console.error("[addPlace]", e2);
        window.CityUtils.showError(e2?.message || "Failed to save");
      } finally {
        window.CityUtils.showLoading(false);
      }
    });
  }

  function setupLocationButton() {
    const btn = document.getElementById("get-location-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      try {
        btn.disabled = true;
        btn.textContent = "⏳ Getting location...";

        const coords = await window.CityGeo.getCurrentPosition();
        currentCoordinates = coords;

        const display = document.getElementById("coordinates-display");
        const value = document.getElementById("coordinates-value");
        if (display && value) {
          value.textContent = window.CityGeo.formatCoordinates(
            coords.lat,
            coords.lng
          );
          display.classList.remove("hidden");
        }

        const previewBtn = document.getElementById("preview-on-map");
        if (previewBtn) {
          previewBtn.href = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
          previewBtn.style.display = "inline-flex";
        }

        btn.textContent = "✅ Location obtained";
      } catch (e) {
        console.error("[getLocation]", e);
        window.CityUtils.showError(e?.message || "Location failed");
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

        const photo = await window.CityCamera.takePhoto();
        currentPhoto = photo;

        showPhotoPreview(photo);
        btn.textContent = "✅ Photo taken";
      } catch (e) {
        console.error("[takePhoto]", e);
        window.CityUtils.showError(e?.message || "Camera failed");
        btn.textContent = "📸 Try again";
      } finally {
        btn.disabled = false;
      }
    });
  }

  function setupChoosePhotoButton() {
    const btn = document.getElementById("choose-photo-btn");
    const input = document.getElementById("photo-file-input");
    if (!btn || !input) return;

    btn.addEventListener("click", () => input.click());

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        btn.disabled = true;
        btn.textContent = "⏳ Loading...";

        if (!file.type.startsWith("image/"))
          throw new Error("Please select an image file");
        if (file.size > 10 * 1024 * 1024)
          throw new Error("File too large. Maximum 10MB");

        const base64 = await window.CityUtils.fileToBase64(file);
        const compressed = await window.CityUtils.compressPhoto(base64);

        currentPhoto = compressed;
        showPhotoPreview(compressed);

        btn.textContent = "✅ Photo selected";
      } catch (e) {
        console.error("[choosePhoto]", e);
        window.CityUtils.showError(e?.message || "Photo load failed");
        btn.textContent = "🖼️ Try again";
      } finally {
        btn.disabled = false;
        input.value = "";
      }
    });
  }

  window.initAddPlacePage = async function initAddPlacePage() {
    setupAddPlaceForm();
    setupLocationButton();
    setupCameraButton();
    setupChoosePhotoButton();
  };
})();
