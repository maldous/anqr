import { loadStore, saveStore } from "./store-helpers.mjs";
import { withStoreLock } from "./with-store-lock.mjs";

export function createDurableSet(name, ttlMs = 0) {
  function isExpired(entry) {
    return ttlMs > 0 && Date.now() - entry.addedAt > ttlMs;
  }

  function pruneExpired(store) {
    if (ttlMs <= 0) return false;
    const now = Date.now();
    let pruned = false;
    for (const [key, entry] of Object.entries(store.entries)) {
      if (now - entry.addedAt > ttlMs) {
        delete store.entries[key];
        pruned = true;
      }
    }
    return pruned;
  }

  return {
    has(key) {
      const store = loadStore(name);
      const entry = store.entries[key];
      if (!entry) return false;
      return !isExpired(entry);
    },
    add(key) {
      withStoreLock(name, () => {
        const store = loadStore(name);
        pruneExpired(store);
        store.entries[key] = { addedAt: Date.now() };
        saveStore(name, store);
      });
    },
    delete(key) {
      withStoreLock(name, () => {
        const store = loadStore(name);
        delete store.entries[key];
        saveStore(name, store);
      });
    },
    keys() {
      const store = loadStore(name);
      if (ttlMs <= 0) return Object.keys(store.entries);
      return Object.entries(store.entries)
        .filter(([, entry]) => !isExpired(entry))
        .map(([key]) => key);
    },
    get size() {
      return this.keys().length;
    },
    clear() {
      withStoreLock(name, () => {
        saveStore(name, { entries: {} });
      });
    },
  };
}
