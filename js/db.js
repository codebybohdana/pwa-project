/**
 * db.js — IndexedDB wrapper for "places"
 */

(function () {
  "use strict";

  const DB_NAME = "CityAssistantDB";
  const DB_VERSION = 1;
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
        }
      };

      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
    });
  }

  function ensureDB() {
    if (!db) throw new Error("DB not initialized. Call initDB() first.");
    return db;
  }

  function addPlace(placeData) {
    ensureDB();
    return new Promise((resolve, reject) => {
      if (!placeData.timestamp) placeData.timestamp = Date.now();

      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const req = store.add(placeData);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function getAllPlaces() {
    ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);

      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  function getPlaceById(id) {
    ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);

      const req = store.get(Number(id));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  function updatePlace(id, placeData) {
    ensureDB();
    return new Promise((resolve, reject) => {
      placeData.id = Number(id);

      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const req = store.put(placeData);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  function deletePlace(id) {
    ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const req = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function searchPlaces(query) {
    const all = await getAllPlaces();
    if (!query || !query.trim()) return all;

    const q = query.toLowerCase().trim();
    return all.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const addr = (p.address || "").toLowerCase();
      const notes = (p.notes || "").toLowerCase();
      return name.includes(q) || addr.includes(q) || notes.includes(q);
    });
  }

  window.CityDB = {
    initDB,
    addPlace,
    getAllPlaces,
    getPlaceById,
    updatePlace,
    deletePlace,
    searchPlaces,
  };
})();
