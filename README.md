# City Assistant – Offline PWA

Aplikacja do zapisywania ulubionych miejsc (adres, notatki, zdjęcie, GPS) i używania ich bez internetu.

---

## Technologie

**HTML, CSS, JavaScript** – bez zewnętrznych bibliotek.

- HTML: struktura, formularze, ARIA (dostępność).
- CSS: zmienne, Grid/Flexbox, media queries.
- JS: IndexedDB, Cache API, Service Worker, Geolocation API, MediaDevices (kamera).

---

## Instalacja PWA

Plik **manifest.webmanifest**: nazwa, ikony (72–512 px, maskable), `start_url`, `theme_color`, `display: standalone`.  
Użytkownik może dodać aplikację na ekran główny („Zainstaluj aplikację” w przeglądarce).

---

## Natywne funkcje (min. 2)

1. **Geolokalizacja** (`navigator.geolocation`) – przy dodawaniu i edycji miejsca. `getCurrentPosition()` → zapis współrzędnych, link do mapy.
2. **Kamera** (`navigator.mediaDevices.getUserMedia`) – zdjęcie miejsca przy dodawaniu/edycji. Dodatkowo: wybór zdjęcia z galerii (input file).

---

## Tryb offline

- **Service Worker** + **Cache API** – shell aplikacji (HTML, CSS, JS, ikony) i zdjęcia miejsc.
- **IndexedDB** – dane miejsc (nazwa, adres, notatki, zdjęcie, współrzędne).
- Użytkownik widzi status Online/Offline i baner „You're offline”. Przy braku sieci i braku strony w cache – strona `offline.html` z linkiem do listy miejsc.

---

## Widoki (min. 3)

- **Lista** (`index.html`) – przeglądanie i wyszukiwanie miejsc.
- **Dodawanie** (`pages/add-place.html`) – formularz z geolokacją i zdjęciem (kamera/galeria).
- **Szczegóły** (`pages/place-details.html`) – podgląd, mapa, Edytuj / Usuń.
- **Edycja** (`pages/edit-place.html`) – zmiana danych, zdjęcia, geolokacji.
- **Offline** (`pages/offline.html`) – komunikat i link do listy.

Przejścia między widokami: przyciski Back, linki (spójny flow).

---

## Hosting i uruchomienie

Aplikacja musi być serwowana przez **HTTPS** (np. GitHub Pages, Netlify).  
Lokalnie: np. **VS Code Live Server** lub `npx serve .` – potem otwórz adres w przeglądarce.

**Test offline:** DevTools → Network → Offline, odśwież stronę – aplikacja działa z cache i IndexedDB.

---

## Responsywność i wydajność

- Układ dopasowany do ekranu (media queries 768 px, 480 px).
- Lazy loading zdjęć, kompresja przed zapisem, zdjęcia w Cache API (nie base64 w DB).

---

## Strategia buforowania (Service Worker)

- **Zasoby statyczne:** przy instalacji – `cache.addAll()`; przy żądaniach – Network First, przy braku sieci – z cache.
- **Zdjęcia miejsc** (`/cached-images/*`): tylko z Cache API (Cache Only).
- **Dokumenty:** Network First; gdy brak sieci i brak w cache → `offline.html`.

---

## Jakość kodu

Kod podzielony na moduły (`app.js`, `db.js`, `utils.js`, `camera.js`, `geolocation.js`, `image-cache.js`, `views/*`). Komentarze przy ważnych fragmentach i w `service-worker.js`.
