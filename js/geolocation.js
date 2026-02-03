function isGeolocationAvailable() {
  return !!navigator.geolocation;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error("Geolocation not supported on this device"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error(
              "Geolocation denied. Allow location access in browser settings."
            )
          );
        } else if (err.code === err.TIMEOUT) {
          reject(new Error("Geolocation timeout. Try again."));
        } else {
          reject(new Error("Geolocation error."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

function formatCoordinates(lat, lng) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(
    4
  )}° ${lngDir}`;
}
