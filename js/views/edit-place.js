/**
 * views/edit-place.js — edit place form
 */

(function () {
  "use strict";

  let currentPlaceId = null;
  let currentPlace = null;

  let newPhoto = null;
  let newCoordinates = null;

  async function loadPlaceForEditing(id) {
    const place = await window.CityDB.getPlaceById(id);
    if (!place) throw new Error("Place not found");
    currentPlace = place;
    fillForm(place);
  }

  function fillForm(place) {
    document.getElementById("place-name").value = place.name || "";
    document.getElementById("place-address").value = place.address || "";
    document.getElementById("place-notes").value = place.notes || "";

    const img = document.getElementById("current-photo-img");
    img.src = "../images/placeholder.png";

    if (place.photo) {
      window.CityImages.getImageUrl(place.photo).then((url) => {
        if (!url) return;
        window.CityImages.revokeObjectUrl(img.dataset.blobUrl);
        img.dataset.blobUrl = url.startsWith("blob:") ? url : "";
        img.src = url;
      });
    }
    img.onerror = () => (img.src = "../images/placeholder.png");

    const value = document.getElementById("current-coordinates-value");
    const mapsBtn = document.getElementById("current-location-maps-btn");

    if (place.coordinates?.lat && place.coordinates?.lng) {
      const { lat, lng } = place.coordinates;
      value.textContent = window.CityGeo.formatCoordinates(lat, lng);
      mapsBtn.href = `https://www.google.com/maps?q=${lat},${lng}`;
      mapsBtn.style.display = "inline-flex";
    } else {
      value.textContent = "Coordinates not specified";
      mapsBtn.style.display = "none";
    }
  }

  function setupNavigationButtons() {
    const backBtn = document.getElementById("back-button");
    const cancelBtn = document.getElementById("cancel-btn");
    if (backBtn) backBtn.href = `place-details.html?id=${currentPlaceId}`;
    if (cancelBtn) cancelBtn.href = `place-details.html?id=${currentPlaceId}`;
  }

  function setupEditForm() {
    const form = document.getElementById("edit-place-form");
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

        const updated = {
          ...currentPlace,
          name,
          address,
          notes: notes || "",
          timestamp: Date.now(),
        };

        if (newPhoto) {
          updated.photo = await window.CityImages.processImageForSave(newPhoto);
          if (
            currentPlace.photo &&
            currentPlace.photo.includes("/cached-images/")
          ) {
            await window.CityImages.deleteImageFromCache(currentPlace.photo);
          }
        }

        if (newCoordinates) updated.coordinates = newCoordinates;

        await window.CityDB.updatePlace(currentPlaceId, updated);

        window.CityUtils.showSuccess("Changes saved successfully!");
        setTimeout(
          () =>
            (window.location.href = `place-details.html?id=${currentPlaceId}`),
          700
        );
      } catch (e2) {
        console.error("[editPlace]", e2);
        window.CityUtils.showError(e2?.message || "Save failed");
      } finally {
        window.CityUtils.showLoading(false);
      }
    });
  }

  function setupChangePhotoButton() {
    const btn = document.getElementById("change-photo-btn");
    const preview = document.getElementById("new-photo-preview");
    const img = document.getElementById("new-photo-img");
    const removeBtn = document.getElementById("remove-new-photo-btn");

    if (!btn || !preview || !img || !removeBtn) return;

    btn.addEventListener("click", async () => {
      try {
        btn.disabled = true;
        btn.textContent = "⏳ Opening camera...";

        const base64 = await window.CityCamera.takePhoto();
        newPhoto = base64;

        img.src = base64;
        preview.classList.remove("hidden");

        removeBtn.onclick = () => {
          newPhoto = null;
          preview.classList.add("hidden");
          btn.textContent = "📸 Take New Photo";
        };

        btn.textContent = "✅ New photo ready";
      } catch (e) {
        console.error("[changePhoto]", e);
        window.CityUtils.showError(e?.message || "Camera failed");
        btn.textContent = "📸 Try again";
      } finally {
        btn.disabled = false;
      }
    });
  }

  function setupChooseNewPhotoButton() {
    const btn = document.getElementById("choose-new-photo-btn");
    const input = document.getElementById("new-photo-file-input");
    const preview = document.getElementById("new-photo-preview");
    const img = document.getElementById("new-photo-img");
    const removeBtn = document.getElementById("remove-new-photo-btn");

    if (!btn || !input || !preview || !img || !removeBtn) return;

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

        newPhoto = compressed;
        img.src = compressed;
        preview.classList.remove("hidden");

        removeBtn.onclick = () => {
          newPhoto = null;
          preview.classList.add("hidden");
          btn.textContent = "🖼️ Choose from Gallery";
        };

        btn.textContent = "✅ Photo selected";
      } catch (e) {
        console.error("[chooseNewPhoto]", e);
        window.CityUtils.showError(e?.message || "Photo load failed");
        btn.textContent = "🖼️ Try again";
      } finally {
        btn.disabled = false;
        input.value = "";
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

        const coords = await window.CityGeo.getCurrentPosition();
        newCoordinates = coords;

        const value = document.getElementById("new-coordinates-value");
        const box = document.getElementById("new-coordinates-display");
        const previewBtn = document.getElementById("preview-new-location");

        if (value && box) {
          value.textContent = window.CityGeo.formatCoordinates(
            coords.lat,
            coords.lng
          );
          box.classList.remove("hidden");
        }

        if (previewBtn) {
          previewBtn.href = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
          previewBtn.style.display = "inline-flex";
        }

        btn.textContent = "✅ New location obtained";
      } catch (e) {
        console.error("[updateLocation]", e);
        window.CityUtils.showError(e?.message || "Location failed");
        btn.textContent = "📍 Try again";
      } finally {
        btn.disabled = false;
      }
    });
  }

  window.initEditPage = async function initEditPage() {
    try {
      const params = new URLSearchParams(window.location.search);
      currentPlaceId = params.get("id");
      if (!currentPlaceId) throw new Error("Place ID not found");

      await loadPlaceForEditing(Number(currentPlaceId));
      setupNavigationButtons();
      setupEditForm();
      setupChangePhotoButton();
      setupChooseNewPhotoButton();
      setupUpdateLocationButton();
    } catch (e) {
      console.error("[initEditPage]", e);
      window.CityUtils?.showError?.("Failed to load edit page");
      setTimeout(() => (window.location.href = "../index.html"), 900);
    }
  };
})();
