import fs from "node:fs";

import { PROBE_LOCK_FILE } from "./probe-lock-file.mjs";
import { logDebug, logInfo } from "./logger.mjs";

const LOCK_STALE_MS = 5 * 60 * 1_000;

export function tryAcquireProbeLock() {
  try {
    // Clean stale lock from crashed executor
    if (fs.existsSync(PROBE_LOCK_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(PROBE_LOCK_FILE, "utf-8"));
        if (Date.now() - data.startedAt > LOCK_STALE_MS) {
          logInfo(
            `🔒 Cleaning stale probe lock (held by ${data.worktree || "unknown"}, pid ${data.pid}, ${Math.round((Date.now() - data.startedAt) / 1000)}s old)`,
          );
          fs.unlinkSync(PROBE_LOCK_FILE);
        }
      } catch {
        // Corrupt lock file — remove it
        try {
          fs.unlinkSync(PROBE_LOCK_FILE);
        } catch {
          // ignore
        }
      }
    }

    // Atomic create — fails with EEXIST if file already exists
    const fd = fs.openSync(PROBE_LOCK_FILE, "wx");
    const lockData = JSON.stringify({
      pid: process.pid,
      worktree: process.env.ANQR_WORKTREE_ID || "unknown",
      startedAt: Date.now(),
    });
    fs.writeSync(fd, lockData);
    fs.closeSync(fd);
    logDebug(`🔒 Acquired probe lock (pid ${process.pid})`);
    return true;
  } catch (err) {
    if (err.code === "EEXIST") return false;
    // Unexpected error (permission, etc.) — don't deadlock, let probe proceed
    logDebug(`🔒 Lock acquire error (proceeding without lock): ${err.message}`);
    return true;
  }
}
