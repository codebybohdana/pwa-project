# City Assistant - Offline PWA

Progressive Web App that lets you save places (address, notes, photo, GPS) and use them offline.

## Features

- ✅ Installable PWA (manifest.webmanifest)
- ✅ Offline mode (Service Worker + Cache API)
- ✅ Local data storage (IndexedDB)
- ✅ Native features:
  - Geolocation (navigator.geolocation)
  - Camera (MediaDevices.getUserMedia)
- ✅ 3+ views: list, add place, details, edit, offline fallback

## Run locally

Use any static server (recommended VS Code Live Server).

## Test Offline

Chrome DevTools → Network → Offline  
Refresh page → app should still work (cached shell + IndexedDB data).

## Hosting

Works on HTTPS hosting like Netlify or GitHub Pages.
