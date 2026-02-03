/**
 * geolocation.js — GPS helpers
 */

(function () {
  "use strict";

  function isGeolocationAvailable() {
    return !!navigator.geolocation;
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!isGeolocationAvailable()) {
        reject(new Error("Geolocation not supported"));
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
        (error) => {
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

  window.CityGeo = {
    isGeolocationAvailable,
    getCurrentPosition,
    formatCoordinates,
  };
})();
