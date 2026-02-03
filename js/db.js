/**
 * db.js
 * IndexedDB для офлайн-зберігання місць.
 * ✅ ВАЖЛИВО: тут НЕ має бути автоматичного initDB на DOMContentLoaded.
 * initDB викликається 1 раз в app.js
 */

const DB_NAME = "CityAssistantDB";
const DB_VERSION = 2;
const STORE_NAME = "places";

let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error);

    req.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        store.createIndex("name", "name", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      } else {
        // Можна робити міграції версій тут при потребі
      }
    };

    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
  });
}

function addPlace(place) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // timestamp завжди оновлюємо
    const data = { ...place, timestamp: Date.now() };

    const req = store.add(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllPlaces() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);

    const req = store.getAll();
    req.onsuccess = () => {
      const list = req.result || [];
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

function getPlaceById(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);

    const req = store.get(Number(id));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function updatePlace(id, place) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const data = { ...place, id: Number(id), timestamp: Date.now() };
    const req = store.put(data);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function deletePlace(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const req = store.delete(Number(id));
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function searchPlaces(query) {
  const q = (query || "").trim().toLowerCase();
  return getAllPlaces().then((all) => {
    if (!q) return all;
    return all.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const addr = (p.address || "").toLowerCase();
      const notes = (p.notes || "").toLowerCase();
      return name.includes(q) || addr.includes(q) || notes.includes(q);
    });
  });
}

window.initDB = initDB;
window.addPlace = addPlace;
window.getAllPlaces = getAllPlaces;
window.getPlaceById = getPlaceById;
window.updatePlace = updatePlace;
window.deletePlace = deletePlace;
window.searchPlaces = searchPlaces;
