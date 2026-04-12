import fs from "node:fs";
import path from "node:path";

function getStoreDir() {
  const base = process.env.ANQR_DURABLE_STATE_DIR
    || path.join(process.env.XDG_RUNTIME_DIR || "/tmp", "anqr-durable-state");
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function getStorePath(name) {
  return path.join(getStoreDir(), `${name}.json`);
}

function loadStore(name) {
  try {
    return JSON.parse(fs.readFileSync(getStorePath(name), "utf-8"));
  } catch {
    return { entries: {}, updatedAt: null };
  }
}

function saveStore(name, store) {
  store.updatedAt = new Date().toISOString();
  const filePath = getStorePath(name);
  const tmpFile = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2) + "\n");
  fs.renameSync(tmpFile, filePath);
}

export function createDurableSet(name, ttlMs = 0) {
  function load() {
    const store = loadStore(name);
    if (ttlMs > 0) {
      const now = Date.now();
      let pruned = false;
      for (const [key, entry] of Object.entries(store.entries)) {
        if (now - entry.addedAt > ttlMs) {
          delete store.entries[key];
          pruned = true;
        }
      }
      if (pruned) saveStore(name, store);
    }
    return store;
  }

  return {
    has(key) {
      const store = load();
      return key in store.entries;
    },
    add(key) {
      const store = load();
      store.entries[key] = { addedAt: Date.now() };
      saveStore(name, store);
    },
    delete(key) {
      const store = load();
      delete store.entries[key];
      saveStore(name, store);
    },
    keys() {
      return Object.keys(load().entries);
    },
    get size() {
      return Object.keys(load().entries).length;
    },
    clear() {
      saveStore(name, { entries: {} });
    },
  };
}

export function createDurableMap(name) {
  function load() {
    return loadStore(name);
  }

  return {
    get(key) {
      const store = load();
      const entry = store.entries[key];
      return entry ? entry.value : undefined;
    },
    set(key, value) {
      const store = load();
      store.entries[key] = { value, updatedAt: Date.now() };
      saveStore(name, store);
    },
    has(key) {
      return key in load().entries;
    },
    delete(key) {
      const store = load();
      delete store.entries[key];
      saveStore(name, store);
    },
    keys() {
      return Object.keys(load().entries);
    },
    values() {
      return Object.values(load().entries).map((e) => e.value);
    },
    entries() {
      return Object.entries(load().entries).map(([k, e]) => [k, e.value]);
    },
    get size() {
      return Object.keys(load().entries).length;
    },
    clear() {
      saveStore(name, { entries: {} });
    },
  };
}

export function createDurableQueue(name) {
  function load() {
    const store = loadStore(name);
    if (!Array.isArray(store.queue)) store.queue = [];
    return store;
  }

  return {
    enqueue(item) {
      const store = load();
      store.queue.push({ item, enqueuedAt: Date.now() });
      saveStore(name, store);
    },
    dequeue() {
      const store = load();
      const entry = store.queue.shift();
      saveStore(name, store);
      return entry ? entry.item : undefined;
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
      saveStore(name, { queue: [] });
    },
  };
}
