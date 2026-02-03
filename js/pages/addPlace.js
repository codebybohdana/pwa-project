let currentPhoto = null;
let currentCoordinates = null;

async function initAddPlacePage() {
  $("add-place-form")?.addEventListener("submit", onSubmit);
  $("get-location-btn")?.addEventListener("click", onGetLocation);
  $("take-photo-btn")?.addEventListener("click", onTakePhoto);
  $("choose-photo-btn")?.addEventListener("click", () =>
    $("photo-file-input")?.click()
  );
  $("photo-file-input")?.addEventListener("change", onChooseFile);
  $("remove-photo-btn")?.addEventListener("click", removePhoto);
}

async function onSubmit(e) {
  e.preventDefault();
  try {
    showLoading(true, "Saving...");
    const name = $("place-name").value.trim();
    const address = $("place-address").value.trim();
    const notes = $("place-notes").value.trim();

    if (!name || !address) throw new Error("Fill required fields");

    const place = {
      name,
      address,
      notes: notes || "",
      photo: currentPhoto || "",
      coordinates: currentCoordinates || null,
      timestamp: Date.now(),
    };

    await addPlace(place);
    showSuccess("Place saved!");
    window.location.href = "../index.html";
  } catch (err) {
    showError(err.message || "Save failed");
  } finally {
    showLoading(false);
  }
}

async function onGetLocation() {
  const btn = $("get-location-btn");
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Getting location...";
    const coords = await getCurrentPosition();
    currentCoordinates = coords;

    $("coordinates-value").textContent = formatCoordinates(
      coords.lat,
      coords.lng
    );
    $("coordinates-display").classList.remove("hidden");

    const link = $("preview-on-map");
    link.href = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    link.hidden = false;

    btn.textContent = "✅ Location obtained";
  } catch (e) {
    showError(e.message);
    btn.textContent = "📍 Try again";
  } finally {
    btn.disabled = false;
  }
}

async function onTakePhoto() {
  const btn = $("take-photo-btn");
  try {
    btn.disabled = true;
    btn.textContent = "⏳ Opening camera...";
    const photo = await takePhoto();
    currentPhoto = photo;
    showPreview(photo);
    btn.textContent = "✅ Photo taken";
  } catch (e) {
    showError(e.message);
    btn.textContent = "📸 Try again";
  } finally {
    btn.disabled = false;
  }
}

async function onChooseFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    if (!file.type.startsWith("image/")) throw new Error("Select image file");
    const base64 = await fileToBase64(file);
    currentPhoto = await compressIfNeeded(base64);
    showPreview(currentPhoto);
    $("choose-photo-btn").textContent = "✅ Photo selected";
  } catch (err) {
    showError(err.message);
  } finally {
    e.target.value = "";
  }
}

function showPreview(dataUrl) {
  $("photo-preview-img").src = dataUrl;
  $("photo-preview").classList.remove("hidden");
}

function removePhoto() {
  currentPhoto = null;
  $("photo-preview").classList.add("hidden");
  $("take-photo-btn").textContent = "📸 Take Photo";
  $("choose-photo-btn").textContent = "🖼️ Choose from Gallery";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("File read error"));
    r.readAsDataURL(file);
  });
}

function compressIfNeeded(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1280;
      const maxH = 720;

      let w = img.width,
        h = img.height;
      if (w <= maxW && h <= maxH) return resolve(dataUrl);

      const ratio = Math.min(maxW / w, maxH / h);
      w = Math.floor(w * ratio);
      h = Math.floor(h * ratio);

      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => reject(new Error("Image load error"));
    img.src = dataUrl;
  });
}
