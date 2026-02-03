/**
 * GEOLOCATION MODULE
 */

function isGeolocationAvailable() {
  return !!navigator.geolocation;
}

async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error("Geolocation not supported"));
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
        resolve(coords);
      },
      (error) => {
        console.error("❌ [getCurrentPosition]", error?.code, error?.message ?? error, error);

        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error("Location access denied. Please allow in settings.")
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error("Unable to determine position."));
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

function formatCoordinates(lat, lng) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  const formattedLat = Math.abs(lat).toFixed(4);
  const formattedLng = Math.abs(lng).toFixed(4);
  return `${formattedLat}° ${latDir}, ${formattedLng}° ${lngDir}`;
}

