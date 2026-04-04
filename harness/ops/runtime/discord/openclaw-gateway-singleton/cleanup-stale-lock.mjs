import { promises as fsp } from "node:fs";

import { LOCK_FILE } from "./lock-file.mjs";
import { isPidAlive } from "./is-pid-alive.mjs";
import { logWarn } from "./log-warn.mjs";
import { readLockInfo } from "./read-lock-info.mjs";

export async function cleanupStaleLock() {
  try {
    const info = await readLockInfo();
    if (!info) return;
    if (isPidAlive(info.runnerPid) || isPidAlive(info.gatewayPid)) return;
    logWarn(
      `Removing stale gateway lock owned by ${info.worktree || "unknown"} (runner ${info.runnerPid || "?"}, gateway ${info.gatewayPid || "?"})`,
    );
    await fsp.unlink(LOCK_FILE);
  } catch (err) {
    if (err.code !== "ENOENT") {
      logWarn(`Failed to clean up lock: ${err.message}`);
    }
  }
}
