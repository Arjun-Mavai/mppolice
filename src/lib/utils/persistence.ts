/**
 * safeStorage
 * -----------------------------------------------------------------
 * A robust wrapper for localStorage that handles Incognito/Private 
 * browsing modes where storage might be locked or restricted.
 * 
 * If native localStorage is unavailable, it falls back to a 
 * non-persistent in-memory store for the current session.
 */

class InMemStore {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

export const getSafeStorage = () => {
  if (typeof window === 'undefined') {
    return new InMemStore();
  }

  try {
    const storage = window.localStorage;
    const testKey = '__mppsc_storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    console.warn('[Storage] LocalStorage is restricted. Using In-Memory fallback.');
    return new InMemStore();
  }
};

export const safeStorage = getSafeStorage();
