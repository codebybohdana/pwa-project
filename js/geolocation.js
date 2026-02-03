/**
 * ========================================
 * GEOLOCATION MODULE
 * ========================================
 * GPS coordinates access
 */

/**
 * Check if geolocation is available
 */
function isGeolocationAvailable() {
  return !!navigator.geolocation;
}

/**
 * Get current position
 */
async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    console.log("📍 Requesting geolocation...");

    if (!isGeolocationAvailable()) {
      reject(new Error("Geolocation not supported on this device"));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log("✅ Geolocation obtained:", coords);
        resolve(coords);
      },
      (error) => {
        console.error("❌ Geolocation error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Geolocation access denied. Please allow access in browser settings."
            )
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(
            new Error("Unable to determine position. Check GPS settings.")
          );
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Timeout. Please try again."));
        } else {
          reject(new Error("Geolocation error."));
        }
      },
      options
    );
  });
}

/**
 * Format coordinates for display
 */
function formatCoordinates(lat, lng) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";

  const formattedLat = Math.abs(lat).toFixed(4);
  const formattedLng = Math.abs(lng).toFixed(4);

  return `${formattedLat}° ${latDir}, ${formattedLng}° ${lngDir}`;
}

console.log("✅ geolocation.js loaded");
