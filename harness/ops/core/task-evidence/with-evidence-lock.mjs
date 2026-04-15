import fs from "node:fs";
import { getEvidencePath } from "./get-evidence-path.mjs";

const LOCK_MAX_ATTEMPTS = 40;
const LOCK_BASE_WAIT_MS = 3;
const LOCK_MAX_BACKOFF_MS = 100;
const LOCK_STALE_MS = 5000;

/**
 * Advisory file-level lock for evidence records.
 *
 * Follows the same O_EXCL + PID + stale-detection pattern used by
 * `withStoreLock` and `acquireStateLock`, but degrades gracefully:
 * if the lock cannot be acquired within ~2.5s, `fn` runs anyway
 * (same as today's unlocked behavior). This ensures evidence writes
 * never block execution, while serializing concurrent updates when
 * possible.
 *
 * @param {string} correlationId
 * @param {() => T} fn
 * @returns {T}
 */
export function withEvidenceLock(correlationId, fn) {
  const lockPath = getEvidencePath(correlationId) + ".lock";
  const acquired = tryAcquireLock(lockPath);
  if (!acquired) {
    process.stderr.write(
      `[task-evidence] Lock contention for ${correlationId}, proceeding unlocked\n`,
    );
    return fn();
  }
  try {
    return fn();
  } finally {
    try {
      fs.unlinkSync(lockPath);
    } catch {
      /* race ok */
    }
  }
}

/**
 * Try to acquire an exclusive lock file using O_EXCL.
 * Returns true if acquired, false if timed out.
 */
function tryAcquireLock(lockPath) {
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
