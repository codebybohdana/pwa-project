function isCameraAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

async function takePhoto() {
  if (!isCameraAvailable()) {
    throw new Error("Camera not supported on this device");
  }

  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    const video = document.createElement("video");
    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.style.position = "fixed";
    video.style.left = "-9999px";
    document.body.appendChild(video);

    await video.play();
    await new Promise((r) => setTimeout(r, 400));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return dataUrl;
  } catch (e) {
    if (e.name === "NotAllowedError")
      throw new Error(
        "Camera denied. Allow camera access in browser settings."
      );
    if (e.name === "NotFoundError") throw new Error("No camera device found.");
    throw e;
  } finally {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    const v = document.querySelector("video[playsinline]");
    if (v) v.remove();
  }
}
