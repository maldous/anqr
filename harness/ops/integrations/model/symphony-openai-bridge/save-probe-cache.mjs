import { ensureStateDir } from "../symphony-credit-gate.mjs";
import fs from "node:fs";

import { PROBE_CACHE_FILE } from "./probe-cache-file.mjs";
import { logDebug, logError } from "./logger.mjs";

export function saveProbeCache(cache) {
  try {
    ensureStateDir();
    fs.writeFileSync(PROBE_CACHE_FILE, JSON.stringify(cache, null, 2));
    logDebug(`Saved probe cache (${cache.probeResults.length} results)`);
  } catch (err) {
    logError(`Failed to save probe cache: ${err.message}`);
  }
}
