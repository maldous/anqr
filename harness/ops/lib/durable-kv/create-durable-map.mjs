import { loadStore, saveStore } from "./store-helpers.mjs";
import { withStoreLock } from "./with-store-lock.mjs";

export function createDurableMap(name) {
  return {
    get(key) {
      const store = loadStore(name);
      const entry = store.entries[key];
      return entry ? entry.value : undefined;
    },
    set(key, value) {
      withStoreLock(name, () => {
        const store = loadStore(name);
        store.entries[key] = { value, updatedAt: Date.now() };
        saveStore(name, store);
      });
    },
    has(key) {
      return key in loadStore(name).entries;
    },
    delete(key) {
      withStoreLock(name, () => {
        const store = loadStore(name);
        delete store.entries[key];
        saveStore(name, store);
      });
    },
    keys() {
      return Object.keys(loadStore(name).entries);
    },
    values() {
      return Object.values(loadStore(name).entries).map((e) => e.value);
    },
    entries() {
      return Object.entries(loadStore(name).entries).map(([k, e]) => [k, e.value]);
    },
    get size() {
      return Object.keys(loadStore(name).entries).length;
    },
    clear() {
      withStoreLock(name, () => {
        saveStore(name, { entries: {} });
      });
    },
  };
}
