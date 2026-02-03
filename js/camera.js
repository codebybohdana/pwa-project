/**
 * CAMERA MODULE
 */

function isCameraAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

async function takePhoto() {
  if (!isCameraAvailable()) {
    throw new Error("Camera not supported on this device");
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });

    const video = document.createElement("video");
    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.style.display = "none";
    document.body.appendChild(video);

    await video.play();
    await new Promise((r) => setTimeout(r, 500));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL("image/jpeg", 0.8);

    stream.getTracks().forEach((track) => track.stop());
    video.remove();

    return photoData;
  } catch (error) {
    console.error("❌ [takePhoto]", error?.name ?? "Error", error?.message ?? error, error);
    if (error.name === "NotAllowedError") {
      throw new Error("Camera access denied. Please allow access in settings.");
    }
    if (error.name === "NotFoundError") {
      throw new Error("Camera not found on this device.");
    }
    if (error.name === "NotReadableError") {
      throw new Error("Camera is already in use by another app.");
    }
    throw error;
  }
}
