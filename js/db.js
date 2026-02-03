/**
 * DATABASE MODULE (IndexedDB)
 */

const DB_NAME = "CityAssistantDB";
const DB_VERSION = 1;
const STORE_NAME = "places";

let db = null;

async function initDB() {
  return new Promise((resolve, reject) => {
    console.log("🔄 Initializing database...");

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("❌ Database error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log("✅ Database opened");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log("🔧 Creating database...");
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
        console.log("✅ Object store created");
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

    request.onsuccess = () => {
      console.log("✅ Place added:", request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("❌ Error:", request.error);
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
      console.log(`✅ Found ${places.length} places`);
      resolve(places);
    };

    request.onerror = () => {
      console.error("❌ Error:", request.error);
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
      console.error("❌ Error:", request.error);
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

    request.onsuccess = () => {
      console.log("✅ Place updated");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Error:", request.error);
      reject(request.error);
    };
  });
}

async function deletePlace(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(Number(id));

    request.onsuccess = () => {
      console.log("✅ Place deleted");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Error:", request.error);
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
    console.error("❌ Search error:", error);
    throw error;
  }
}

console.log("✅ db.js loaded");
