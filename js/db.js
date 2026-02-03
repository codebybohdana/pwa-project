/**
 * DATABASE MODULE (IndexedDB)
 */

const DB_NAME = "CityAssistantDB";
const DB_VERSION = 1;
const STORE_NAME = "places";

let db = null;

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("❌ [initDB] Database open failed:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

async function addPlace(placeData) {
  return new Promise((resolve, reject) => {
    if (!placeData.timestamp) {
      placeData.timestamp = Date.now();
    }

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.add(placeData);

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      console.error("❌ [addPlace] IndexedDB error:", request.error);
      reject(request.error);
    };
  });
}

async function getAllPlaces() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const places = request.result;
      places.sort((a, b) => b.timestamp - a.timestamp);
      resolve(places);
    };

    request.onerror = () => {
      console.error("❌ [getAllPlaces] IndexedDB error:", request.error);
      reject(request.error);
    };
  });
}

async function getPlaceById(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(Number(id));

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error("❌ [getPlaceById] IndexedDB error:", request.error);
      reject(request.error);
    };
  });
}

async function updatePlace(id, placeData) {
  return new Promise((resolve, reject) => {
    placeData.id = Number(id);
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(placeData);

    request.onsuccess = () => resolve();

    request.onerror = () => {
      console.error("❌ [updatePlace] IndexedDB error:", request.error);
      reject(request.error);
    };
  });
}

async function deletePlace(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(Number(id));

    request.onsuccess = () => resolve();

    request.onerror = () => {
      console.error("❌ [deletePlace] IndexedDB error:", request.error);
      reject(request.error);
    };
  });
}

async function searchPlaces(query) {
  try {
    const allPlaces = await getAllPlaces();
    if (!query || query.trim() === "") {
      return allPlaces;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = allPlaces.filter((place) => {
      const nameMatch = place.name.toLowerCase().includes(searchTerm);
      const addressMatch = place.address.toLowerCase().includes(searchTerm);
      const notesMatch =
        place.notes && place.notes.toLowerCase().includes(searchTerm);
      return nameMatch || addressMatch || notesMatch;
    });

    return filtered;
  } catch (error) {
    console.error("❌ [searchPlaces] Error:", error?.message ?? error, error);
    throw error;
  }
}

