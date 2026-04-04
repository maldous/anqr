// Generated from ../../../scripts/ops/core/symphony-state.mjs:55

import fs from "node:fs";

import { LOCK_MAX_RETRIES } from "./lock-max-retries.mjs";
import { LOCK_RETRY_INTERVAL_MS } from "./lock-retry-interval-ms.mjs";
import { LOCK_STALE_MS } from "./lock-stale-ms.mjs";
import { ensureDir } from "./ensure-dir.mjs";
import { getLockFile } from "./get-lock-file.mjs";
import { isLockProcessAlive } from "./is-lock-process-alive.mjs";

export function acquireStateLock() {
  ensureDir();
  const lockFile = getLockFile();
  for (let attempt = 0; attempt < LOCK_MAX_RETRIES; attempt++) {
    try {
      const fd = fs.openSync(
        lockFile,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
        0o644,
      );
      fs.writeSync(fd, String(process.pid));
      fs.closeSync(fd);
      return true;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      try {
        const lockPid = Number(fs.readFileSync(lockFile, "utf-8").trim());
        if (lockPid && !isLockProcessAlive(lockPid)) {
          try {
            fs.unlinkSync(lockFile);
          } catch {
            /* race ok */
          }
          continue;
        }
        const lockAge = Date.now() - fs.statSync(lockFile).mtimeMs;
        if (lockAge > LOCK_STALE_MS) {
          try {
            fs.unlinkSync(lockFile);
          } catch {
            /* race ok */
          }
          continue;
        }
      } catch {
        continue;
      }
      const end = Date.now() + LOCK_RETRY_INTERVAL_MS + Math.random() * LOCK_RETRY_INTERVAL_MS;
      while (Date.now() < end) {
        /* brief busy-wait */
      }
    }
  }
  return false;
}
