/**
 * camera.js — Take photo via MediaDevices
 */

(function () {
  "use strict";

  function isCameraAvailable() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async function takePhoto() {
    if (!isCameraAvailable())
      throw new Error("Camera not supported on this device");

    let stream = null;
    let video = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.style.position = "fixed";
      video.style.left = "-9999px";
      video.style.top = "-9999px";
      document.body.appendChild(video);

      await video.play();
      await new Promise((r) => setTimeout(r, 400));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      const name = error?.name || "";
      if (name === "NotAllowedError")
        throw new Error(
          "Camera access denied. Please allow access in settings."
        );
      if (name === "NotFoundError")
        throw new Error("Camera not found on this device.");
      if (name === "NotReadableError")
        throw new Error("Camera is already in use by another app.");
      throw error;
    } finally {
      try {
        if (stream) stream.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        if (video) video.remove();
      } catch {}
    }
  }

  window.CityCamera = {
    isCameraAvailable,
    takePhoto,
  };
})();
