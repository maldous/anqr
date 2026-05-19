import fs from "node:fs";

import { PROBE_CACHE_FILE } from "./probe-cache-file.mjs";
import { PROBE_CACHE_TTL_MS } from "./probe-cache-ttl-ms.mjs";
import { logDebug, logWarn } from "./logger.mjs";

const EXPIRED_CACHE_LOG_KEY = "__anqrProbeCacheExpiredLogged";

// Mirror of the save threshold — reject any cache with fewer than this many
// available providers. Prevents a previously-saved poisoned cache (written
// before this guard existed) from being loaded and applied.
const MIN_HEALTHY_PROVIDERS = 10;

export function loadProbeCache() {
  try {
    if (!fs.existsSync(PROBE_CACHE_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(PROBE_CACHE_FILE, "utf-8"));

    // Reject cache with missing or invalid lastProbeAt.
    const probeTime = new Date(data.lastProbeAt).getTime();
    if (Number.isNaN(probeTime)) {
      logDebug(`Probe cache has invalid lastProbeAt: ${data.lastProbeAt}`);
      return null;
    }

    const age = Date.now() - probeTime;
    if (age > PROBE_CACHE_TTL_MS) {
      if (!globalThis[EXPIRED_CACHE_LOG_KEY]) {
        logDebug(`Probe cache expired (${Math.round(age / 1000)}s old)`);
        globalThis[EXPIRED_CACHE_LOG_KEY] = true;
      }
      return null;
    }

    // Reject caches with too few available providers — these are poisoned results
    // from a bad probe cycle (network outage, broken caller, health cascade).
    const available = data.probeResults?.filter((r) => r.available).length ?? 0;
    const total = data.probeResults?.length ?? 0;
    if (available < MIN_HEALTHY_PROVIDERS) {
      logWarn(
        `⚠️ Probe cache REJECTED on load — only ${available}/${total} providers available ` +
        `(minimum ${MIN_HEALTHY_PROVIDERS}). Re-probing from scratch.`,
      );
      return null;
    }

    return data;
  } catch (err) {
    logDebug(`Failed to load probe cache: ${err.message}`);
    return null;
  }
}
