import fs from "node:fs";

import { PROBE_LOCK_FILE } from "./probe-lock-file.mjs";
import { logDebug } from "./logger.mjs";

export function releaseProbeLock() {
  try {
    fs.unlinkSync(PROBE_LOCK_FILE);
    logDebug(`🔒 Released probe lock`);
  } catch {
    // ignore — file may already be gone
  }
}
