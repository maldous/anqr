import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

import { logDebug, logError } from "./logger.mjs";

const FILE_NAME = "provider-probe-cache.json";

export function saveProbeCache(cache) {
  try {
    saveBridgeFile(FILE_NAME, cache, { withLock: true });
    logDebug(`Saved probe cache (${cache.probeResults.length} results)`);
  } catch (err) {
    logError(`Failed to save probe cache: ${err.message}`);
  }
}
