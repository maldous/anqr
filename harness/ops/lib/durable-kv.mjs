import fs from "node:fs";
import path from "node:path";

function getStoreDir() {
  const base =
    process.env.ANQR_DURABLE_STATE_DIR ||
    path.join(process.env.XDG_RUNTIME_DIR || "/tmp", "anqr-durable-state");
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

const LOCK_MAX_ATTEMPTS = 60;
const LOCK_BASE_WAIT_MS = 5;
const LOCK_STALE_MS = 5000;

function withStoreLock(name, fn) {
  const lockPath = `${getStorePath(name)}.lock`;
  let backoffMs = LOCK_BASE_WAIT_MS;

  for (let attempt = 0; attempt < LOCK_MAX_ATTEMPTS; attempt++) {
    try {
      const fd = fs.openSync(
        lockPath,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
        0o644,
      );
      fs.writeSync(fd, `${process.pid}\n${Date.now()}`);
      fs.closeSync(fd);
      try {
        return fn();
      } finally {
        try {
          fs.unlinkSync(lockPath);
        } catch {
          /* race ok */
        }
      }
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      try {
        const stat = fs.statSync(lockPath);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          try {
            fs.unlinkSync(lockPath);
          } catch {
            /* race ok */
          }
          continue;
        }
      } catch {
        continue;
      }
      const waitMs = backoffMs + Math.random() * backoffMs * 0.5;
      const end = Date.now() + waitMs;
      while (Date.now() < end) {
        /* intentional sync wait — kept short by backoff cap */
      }
      backoffMs = Math.min(backoffMs * 1.5, 200);
    }
  }
  throw new Error(
    `[durable-kv] Lock acquisition failed for "${name}" after ${LOCK_MAX_ATTEMPTS} attempts — refusing unlocked mutation`,
  );
}

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
