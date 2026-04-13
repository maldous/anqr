import fs from "node:fs";
import { getStorePath } from "./store-helpers.mjs";

const LOCK_MAX_ATTEMPTS = 60;
const LOCK_BASE_WAIT_MS = 5;
const LOCK_STALE_MS = 5000;

export function withStoreLock(name, fn) {
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
