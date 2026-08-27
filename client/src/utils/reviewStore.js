// IndexedDB storage handler for user reviews and media uploads

const DB_NAME = "UvaExplorerDB";
const DB_VERSION = 1;
const STORE_NAME = "reviews";

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "_id" });
        store.createIndex("placeId", "placeId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function saveReviewToStore(placeId, review) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const reviewItem = {
        ...review,
        _id: review._id || review.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        placeId: String(placeId),
        createdAt: review.createdAt || new Date().toISOString(),
      };

      const req = store.put(reviewItem);
      req.onsuccess = () => resolve(reviewItem);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("IndexedDB save error, falling back to memory:", err);
    return review;
  }
}

export async function getReviewsFromStore(placeId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const all = req.result || [];
        const filtered = all.filter(
          (r) =>
            String(r.placeId) === String(placeId) ||
            String(r.place?._id) === String(placeId) ||
            String(r.place?.id) === String(placeId)
        );
        // Sort descending by creation date
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(filtered);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("IndexedDB fetch error:", err);
    return [];
  }
}

export async function getAllReviewsFromStore() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const all = req.result || [];
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(all);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("IndexedDB fetch all error:", err);
    return [];
  }
}

export async function deleteReviewFromStore(reviewId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(reviewId);

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("IndexedDB delete error:", err);
    return false;
  }
}
