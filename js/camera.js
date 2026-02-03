/**
 * ========================================
 * CAMERA MODULE
 * ========================================
 * Device camera access and photo capture
 */

/**
 * Check if camera is available
 */
function isCameraAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Take photo using camera
 */
async function takePhoto() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("📸 Requesting camera access...");

      if (!isCameraAvailable()) {
        throw new Error("Camera not supported on this device");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      console.log("✅ Camera access granted");

      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.style.display = "none";
      document.body.appendChild(video);

      await video.play();
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const photoData = canvas.toDataURL("image/jpeg", 0.8);

      console.log("✅ Photo taken");

      stream.getTracks().forEach((track) => track.stop());
      video.remove();

      resolve(photoData);
    } catch (error) {
      console.error("❌ Camera error:", error);

      if (error.name === "NotAllowedError") {
        reject(
          new Error(
            "Camera access denied. Please allow access in browser settings."
          )
        );
      } else if (error.name === "NotFoundError") {
        reject(new Error("Camera not found on this device."));
      } else if (error.name === "NotReadableError") {
        reject(new Error("Camera is already in use by another app."));
      } else {
        reject(error);
      }
    }
  });
}

console.log("✅ camera.js loaded");
