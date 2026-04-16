import fs from "node:fs";

const LOCK_MAX_ATTEMPTS = 40;
const LOCK_BASE_WAIT_MS = 3;
const LOCK_MAX_BACKOFF_MS = 100;
const LOCK_STALE_MS = 5000;

/**
 * Try to acquire an exclusive lock file using O_EXCL.
 * Returns true if acquired, false if timed out.
 */
export function tryAcquireLock(lockPath) {
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
      return true;
    } catch (err) {
      if (err.code !== "EEXIST") return false;
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
      backoffMs = Math.min(backoffMs * 1.5, LOCK_MAX_BACKOFF_MS);
    }
  }
  return false;
}
