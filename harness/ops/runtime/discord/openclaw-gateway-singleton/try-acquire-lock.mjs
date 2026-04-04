// Generated from ../../../../scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs:105

import { promises as fsp } from "node:fs";

import { LOCK_FILE } from "./lock-file.mjs";
import { PORT } from "./port.mjs";
import { setLockHeld } from "./lock-held.mjs";
import { logError } from "./log-error.mjs";
import { logInfo } from "./log-info.mjs";
import { writeLockMetadata } from "./write-lock-metadata.mjs";

export async function tryAcquireLock() {
  try {
    const handle = await fsp.open(LOCK_FILE, "wx");
    await handle.close();
    setLockHeld(true);
    await writeLockMetadata();
    logInfo(`Acquired gateway lock (port ${PORT})`);
    return true;
  } catch (err) {
    if (err.code === "EEXIST") {
      return false;
    }
    logError(`Failed to acquire gateway lock: ${err.message}`);
    return false;
  }
}
