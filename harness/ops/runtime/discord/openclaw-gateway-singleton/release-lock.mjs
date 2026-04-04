import { promises as fsp } from "node:fs";

import { LOCK_FILE } from "./lock-file.mjs";
import { lockHeld, setLockHeld } from "./lock-held.mjs";
import { logInfo } from "./log-info.mjs";
import { logWarn } from "./log-warn.mjs";

export async function releaseLock() {
  if (!lockHeld) return;
  setLockHeld(false);
  try {
    await fsp.unlink(LOCK_FILE);
    logInfo("Released gateway lock");
  } catch (err) {
    if (err.code !== "ENOENT") {
      logWarn(`Failed to release lock: ${err.message}`);
    }
  }
}
