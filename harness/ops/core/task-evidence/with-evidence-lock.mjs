import fs from "node:fs";
import { getEvidencePath } from "./get-evidence-path.mjs";
import { tryAcquireLock } from "./try-acquire-lock.mjs";

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
