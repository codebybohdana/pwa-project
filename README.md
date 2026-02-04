# City Assistant – Offline PWA

Aplikacja do zapisywania miejsc (adres, notatki, zdjęcie, GPS) i używania ich bez internetu.

Hostedowana na **Netlify**: [pwa-project.netlify.app](https://city-assistant.netlify.app)

---

## Technologie

**HTML, CSS, JavaScript**
IndexedDB, Cache API, Service Worker, Geolocation API, MediaDevices API.

---

## Uruchomienie

```bash
# Lokalnie (wymaga HTTPS dla kamera/geolokacją):
npx serve .
# lub VS Code → Live Server
```

---

## Struktura widoków

| Widok | Plik | Funkcja |
|-------|------|---------|
| Lista | `index.html` | Przeglądanie i wyszukiwanie miejsc |
| Dodanie | `pages/add-place.html` | Formularz + kamera + geolokacja |
| Szczegóły | `pages/place-details.html` | Podgląd, mapa, edytuj/usuń |
| Edycja | `pages/edit-place.html` | Zmiana danych, zdjęcia, lokalizacji |
| Offline | `pages/offline.html` | Komunikat + link do listy |

---

## Natywne funkcje urządzenia

1. **Geolokalizacja** (`navigator.geolocation.getCurrentPosition`) – zapis GPS przy dodawaniu/edycji miejsca, link do Google Maps.
2. **Kamera** (`navigator.mediaDevices.getUserMedia`) – zdjęcie miejsca. Fallback: wybór z galerii (`<input type="file">`).

---

## Offline & Service Worker

- **App shell** (HTML, CSS, JS, ikony) – precache przy instalacji SW, Network First przy żądaniach.
- **Dane miejsc** – IndexedDB (zdjęcia jako base64, współrzędne, notatki).
- **Statyczne zasoby** (CSS/JS) – Stale-While-Revalidate.
- **Fallback** – przy braku sieci otwiera się `offline.html`, auto-redirect przy powrocie online.
- Banner "You're offline" + status indicator w headerze.

---

## PWA Instalacja

`manifest.webmanifest` zawiera: nazwa, ikony (72–512 px + maskable), `start_url`, `theme_color`, `display: standalone`.
Użytkownik może dodać aplikację na ekran główny urządzenia.

---

## Responsywność & wydajność

- Media queries: 768 px, 480 px. Grid auto-fill dla kartek.
- Kompresja zdjęć przed zapisem (max 1920×1080, JPEG 0.8).
- Lazy loading + `decoding="async"` na imagach.
- `prefers-reduced-motion` dla animacji.
