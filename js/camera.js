/**
 * camera.js
 * Камера через getUserMedia (працює тільки на HTTPS).
 */

function takePhoto() {
  return new Promise(async (resolve, reject) => {
    try {
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        reject(new Error("Camera is not supported on this device."));
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.style.position = "fixed";
      video.style.left = "-9999px";
      document.body.appendChild(video);

      await video.play();

      // Невелика пауза, щоб камера “прокинулась”
      await new Promise((r) => setTimeout(r, 350));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      // Закриваємо камеру
      stream.getTracks().forEach((t) => t.stop());
      video.remove();

      resolve(dataUrl);
    } catch (e) {
      if (e.name === "NotAllowedError") {
        reject(new Error("Camera permission denied."));
      } else if (e.name === "NotFoundError") {
        reject(new Error("Camera not found."));
      } else {
        reject(new Error("Camera error: " + (e.message || e)));
      }
    }
  });
}

window.takePhoto = takePhoto;
