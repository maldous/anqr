import { promises as fsp } from "node:fs";

import { LOCK_FILE } from "./lock-file.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { lockHeld } from "./lock-held.mjs";
import { logWarn } from "./log-warn.mjs";

export async function writeLockMetadata(extra = {}) {
  if (!lockHeld) return;
  const metadata = {
    worktree: WORKTREE_ID,
    runnerPid: process.pid,
    gatewayPid: extra.gatewayPid || null,
    updatedAt: new Date().toISOString(),
  };
  try {
    await fsp.writeFile(LOCK_FILE, JSON.stringify(metadata));
  } catch (err) {
    logWarn(`Unable to update lock metadata: ${err.message}`);
  }
}
