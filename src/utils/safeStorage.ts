import { Aset } from '../types';

const IDB_NAME = 'sipades_sirombu_db';
const IDB_VERSION = 1;
const IDB_STORE_ASETS = 'asets_store';

/**
 * Open or initialize IndexedDB for robust large asset storage
 */
function openIDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onerror = () => resolve(null);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(IDB_STORE_ASETS)) {
          db.createObjectStore(IDB_STORE_ASETS, { keyPath: 'id' });
        }
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save complete assets to IndexedDB (unlimited quota, supports large images)
 */
export async function saveAsetsToIndexedDB(asets: Aset[]): Promise<boolean> {
  try {
    const db = await openIDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_ASETS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_ASETS);
      store.clear();

      for (const item of asets) {
        store.put(item);
      }

      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('[IDB] Failed to save asets to IndexedDB:', err);
    return false;
  }
}

/**
 * Load complete assets from IndexedDB
 */
export async function loadAsetsFromIndexedDB(): Promise<Aset[] | null> {
  try {
    const db = await openIDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_ASETS, 'readonly');
      const store = tx.objectStore(IDB_STORE_ASETS);
      const request = store.getAll();

      request.onsuccess = () => {
        db.close();
        const results = request.result as Aset[];
        if (Array.isArray(results) && results.length > 0) {
          resolve(results);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Strip heavy base64 photos from asets array for safe localStorage storage
 */
export function createLightweightAsets(asets: Aset[]): Aset[] {
  return asets.map((a) => {
    // Keep first photo thumbnail if small (< 20KB), else strip photos from localStorage cache
    const firstPhoto = a.fotoAset && a.fotoAset[0] && a.fotoAset[0].length < 25000 ? [a.fotoAset[0]] : [];
    return {
      ...a,
      fotoAset: firstPhoto,
      fotoBast: undefined,
    };
  });
}

/**
 * Safe localStorage setter that handles QuotaExceededError gracefully without crashing
 */
export function safeLocalStorageSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] localStorage quota reached for key "${key}". Applying quota relief.`);

    try {
      // If it's the asets key, strip heavy images and store lightweight representation
      if (key === 'sipad_asets_v2') {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const lightweight = createLightweightAsets(parsed);
          localStorage.setItem(key, JSON.stringify(lightweight));
          return true;
        }
      }

      // Try removing legacy or non-essential cache
      localStorage.removeItem('sipad_asets_v1');
      localStorage.removeItem('sipades_temp');
      localStorage.setItem(key, value);
      return true;
    } catch {
      // Final safeguard: silently do not throw to protect React UI and data entry session
      console.warn(`[SafeStorage] Suppressed QuotaExceededError for "${key}". Data is retained in memory and server.`);
      return false;
    }
  }
}
