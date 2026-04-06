import fs from "node:fs";

import { PROBE_CACHE_FILE } from "./probe-cache-file.mjs";
import { PROBE_CACHE_TTL_MS } from "./probe-cache-ttl-ms.mjs";
import { logDebug } from "./logger.mjs";

const EXPIRED_CACHE_LOG_KEY = "__anqrProbeCacheExpiredLogged";

export function loadProbeCache() {
  try {
    if (!fs.existsSync(PROBE_CACHE_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(PROBE_CACHE_FILE, "utf-8"));
    const age = Date.now() - new Date(data.lastProbeAt).getTime();
    if (age > PROBE_CACHE_TTL_MS) {
      if (!globalThis[EXPIRED_CACHE_LOG_KEY]) {
        logDebug(`Probe cache expired (${Math.round(age / 1000)}s old)`);
        globalThis[EXPIRED_CACHE_LOG_KEY] = true;
      }
      return null;
    }
    logDebug(
      `Loaded probe cache (${Math.round(age / 1000)}s old, ${data.probeResults.length} results)`,
    );
    return data;
  } catch (err) {
    logDebug(`Failed to load probe cache: ${err.message}`);
    return null;
  }
}
