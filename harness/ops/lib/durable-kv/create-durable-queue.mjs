import { loadStore, saveStore } from "./store-helpers.mjs";
import { withStoreLock } from "./with-store-lock.mjs";

export function createDurableQueue(name) {
  function load() {
    const store = loadStore(name);
    if (!Array.isArray(store.queue)) store.queue = [];
    return store;
  }

  return {
    enqueue(item) {
      withStoreLock(name, () => {
        const store = load();
        store.queue.push({ item, enqueuedAt: Date.now() });
        saveStore(name, store);
      });
    },
    dequeue() {
      return withStoreLock(name, () => {
        const store = load();
        const entry = store.queue.shift();
        saveStore(name, store);
        return entry ? entry.item : undefined;
      });
    },
    peek() {
      const store = load();
      return store.queue[0]?.item;
    },
    items() {
      return load().queue.map((e) => e.item);
    },
    get length() {
      return load().queue.length;
    },
    clear() {
      withStoreLock(name, () => {
        saveStore(name, { queue: [] });
      });
    },
  };
}
