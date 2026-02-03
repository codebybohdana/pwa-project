const DB_NAME = "CityAssistantDB";
const DB_VERSION = 1;
const STORE = "places";

let db = null;

function initDB() {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error);

    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE)) {
        const store = database.createObjectStore(STORE, {
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

function addPlace(place) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.add(place);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllPlaces() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const data = req.result || [];
      data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(data);
    };
    req.onerror = () => reject(req.error);
  });
}

function getPlaceById(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(Number(id));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function updatePlace(id, place) {
  return new Promise((resolve, reject) => {
    place.id = Number(id);
    const tx = db.transaction([STORE], "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(place);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function deletePlace(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.delete(Number(id));
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function searchPlaces(query) {
  const all = await getAllPlaces();
  if (!query || !query.trim()) return all;

  const q = query.toLowerCase().trim();
  return all.filter((p) => {
    const a = (p.address || "").toLowerCase();
    const n = (p.name || "").toLowerCase();
    const notes = (p.notes || "").toLowerCase();
    return n.includes(q) || a.includes(q) || notes.includes(q);
  });
}
