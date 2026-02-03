/**
 * ========================================
 * DATABASE MODULE (IndexedDB)
 * ========================================
 * Local database for storing places offline
 */

// Database configuration
const DB_NAME = "CityAssistantDB";
const DB_VERSION = 1;
const STORE_NAME = "places";

let db = null;

/**
 * Initialize database
 */
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
      console.log("✅ Database opened successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log("🔧 Creating database structure...");

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

/**
 * Add new place
 */
async function addPlace(placeData) {
  return new Promise((resolve, reject) => {
    console.log("📝 Adding place:", placeData.name);

    if (!placeData.timestamp) {
      placeData.timestamp = Date.now();
    }

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.add(placeData);

    request.onsuccess = () => {
      console.log("✅ Place added with ID:", request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("❌ Error adding place:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Get all places
 */
async function getAllPlaces() {
  return new Promise((resolve, reject) => {
    console.log("📖 Getting all places...");

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
      console.error("❌ Error getting places:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Get place by ID
 */
async function getPlaceById(id) {
  return new Promise((resolve, reject) => {
    console.log("🔍 Getting place with ID:", id);

    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(Number(id));

    request.onsuccess = () => {
      if (request.result) {
        console.log("✅ Place found:", request.result.name);
        resolve(request.result);
      } else {
        console.log("⚠️ Place not found");
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error("❌ Error getting place:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Update place
 */
async function updatePlace(id, placeData) {
  return new Promise((resolve, reject) => {
    console.log("✏️ Updating place with ID:", id);

    placeData.id = Number(id);

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(placeData);

    request.onsuccess = () => {
      console.log("✅ Place updated");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Error updating place:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Delete place
 */
async function deletePlace(id) {
  return new Promise((resolve, reject) => {
    console.log("🗑️ Deleting place with ID:", id);

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(Number(id));

    request.onsuccess = () => {
      console.log("✅ Place deleted");
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Error deleting place:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Search places
 */
async function searchPlaces(query) {
  try {
    console.log("🔍 Searching places:", query);

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

    console.log(`✅ Found ${filtered.length} results`);
    return filtered;
  } catch (error) {
    console.error("❌ Search error:", error);
    throw error;
  }
}

// Initialize DB on load
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initDB().catch((error) => {
      console.error("❌ Critical DB initialization error:", error);
    });
  });
}

console.log("✅ db.js loaded");
