import fs from "node:fs";

import { LOCK_MAX_RETRIES } from "../lock-max-retries.mjs";
import { LOCK_RETRY_INTERVAL_MS } from "../lock-retry-interval-ms.mjs";
import { LOCK_STALE_MS } from "../lock-stale-ms.mjs";
import { ensureDir } from "../ensure-dir.mjs";
import { getLockFile } from "../get-lock-file.mjs";
import { isLockProcessAlive } from "../is-lock-process-alive.mjs";
import { sleepSync } from "./sleep-sync.mjs";

export function acquireStateLock() {
  ensureDir();
  const lockFile = getLockFile();
  let backoffMs = LOCK_RETRY_INTERVAL_MS;
  const maxBackoffMs = 500;

  for (let attempt = 0; attempt < LOCK_MAX_RETRIES; attempt++) {
    try {
      const fd = fs.openSync(
        lockFile,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL,
        0o644,
      );
      fs.writeSync(fd, `${process.pid}\n${new Date().toISOString()}`);
      fs.closeSync(fd);
      return true;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;

      try {
        const lockContent = fs.readFileSync(lockFile, "utf-8").trim();
        const lockPid = Number(lockContent.split("\n")[0]);

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
          process.stderr.write(
            `[state-lock] Stale lock detected (age=${Math.round(lockAge / 1000)}s, pid=${lockPid}, holder-alive=${isLockProcessAlive(lockPid)}) — breaking\n`,
          );
          try {
            fs.unlinkSync(lockFile);
          } catch {
            /* race ok */
          }
          continue;
        }

        if (attempt > 0 && attempt % 20 === 0) {
          process.stderr.write(
            `[state-lock] Contention: attempt=${attempt}/${LOCK_MAX_RETRIES}, holder-pid=${lockPid}, age=${Math.round(lockAge / 1000)}s, backoff=${backoffMs}ms\n`,
          );
        }
      } catch {
        continue;
      }

      sleepSync(backoffMs + Math.random() * backoffMs * 0.5);
      backoffMs = Math.min(backoffMs * 1.5, maxBackoffMs);
    }
  }

  process.stderr.write(
    `[state-lock] FAILED to acquire lock after ${LOCK_MAX_RETRIES} attempts (pid=${process.pid})\n`,
  );
  return false;
}
