# 📍 Offline City Assistant

Progressive Web Application for saving favorite city places with offline functionality.

![PWA](https://img.shields.io/badge/PWA-Ready-green) ![HTML5](https://img.shields.io/badge/HTML5-E34F26) ![CSS3](https://img.shields.io/badge/CSS3-1572B6) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E)

## 📋 Description

A PWA application that allows users to save city places with photos and GPS location. Works fully offline and can be installed as a native app.

## ✨ Features

**Main functionality:**

- ✅ Add places (name, address, notes)
- ✅ Take photos (Camera API)
- ✅ Save GPS location (Geolocation API)
- ✅ Search places
- ✅ Full offline functionality
- ✅ Install as native app

**Native device features:**

1. 📸 **Camera API** - take photos using device camera
2. 📍 **Geolocation API** - get GPS coordinates

## 🛠️ Technologies

- **HTML5, CSS3, JavaScript (ES6+)**
- **PWA:** Service Workers, Web App Manifest, IndexedDB
- **Native APIs:** Camera, Geolocation

## 🚀 Installation & Running

### Local Development:

**Live Server (VS Code):**

```bash
1. Install "Live Server" extension
2. Right-click index.html → "Open with Live Server"
```

**Python:**

```bash
python3 -m http.server 8000
# Open: http://localhost:8000
```

**Node.js:**

```bash
npx http-server -p 8000
```

⚠️ **HTTPS required** (or localhost) for Camera API and Service Workers

## 📱 Installing as PWA

**Desktop (Chrome):**

1. Open the app
2. Click install icon ➕ in address bar
3. Click "Install"

**Mobile:**

- **Android:** Menu → "Add to Home screen"
- **iOS:** Share → "Add to Home Screen"

## 🔄 Caching Strategy

| Resource Type | Strategy      | Description                        |
| ------------- | ------------- | ---------------------------------- |
| HTML          | Network First | Always fresh, fallback to cache    |
| CSS/JS        | Cache First   | Fast loading, update in background |
| Images        | Cache First   | Save bandwidth                     |

## 🧪 Testing

**Offline mode:**

```
1. DevTools (F12) → Network
2. Online → Offline
3. Reload (Ctrl+R)
4. ✅ App should work
```

**Lighthouse:**

```
1. DevTools → Lighthouse
2. Generate report
3. Target: PWA 100/100
```

## 💾 Data Storage

**IndexedDB:** All places (name, address, photos, GPS)  
**Cache Storage:** Static files (HTML, CSS, JS, images)  
**Total size:** ~284 kB

## 🌐 Browser Compatibility

| Browser | Version | Support |
| ------- | ------- | ------- |
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## 📊 Project Requirements

- [x] **Technologies:** HTML, CSS, JavaScript
- [x] **Installable:** Manifest + icons
- [x] **Native features:** Camera API + Geolocation API (2/2)
- [x] **Offline:** Service Worker + cache
- [x] **3 views:** index.html, add-place.html, place-details.html
- [x] **Responsive:** Mobile, tablet, desktop
- [x] **Cache strategy:** Network-first (HTML), Cache-first (assets)
- [x] **Code quality:** Comments, error handling
- [x] **Documentation:** README.md
