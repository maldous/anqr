import fs from "node:fs";
import path from "node:path";
import { getBridgeStateDir } from "./get-bridge-state-dir-impl.mjs";

const LOCK_MAX_ATTEMPTS = 60;
const LOCK_BASE_WAIT_MS = 5;
const LOCK_STALE_MS = 5000;

/**
 * Acquire a file lock, run `fn`, then release the lock.
 * Uses the same pattern as durable-kv/with-store-lock.mjs but
 * operates on arbitrary files under the bridge state directory.
 *
 * @param {string} fileName - File name relative to bridge state dir (e.g. "provider-health.json")
 * @param {() => T} fn - Synchronous function to run while holding the lock
 * @returns {T}
 */
export function withBridgeLock(fileName, fn) {
  const dir = getBridgeStateDir();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const lockPath = path.join(dir, `${fileName}.lock`);
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
    `[bridge-state] Lock acquisition failed for "${fileName}" after ${LOCK_MAX_ATTEMPTS} attempts — refusing unlocked mutation`,
  );
}
