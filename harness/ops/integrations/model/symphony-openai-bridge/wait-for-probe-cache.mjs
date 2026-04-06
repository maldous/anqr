import { logDebug } from "./logger.mjs";

const CACHE_POLL_INTERVAL_MS = 2_000;
const CACHE_POLL_MAX_MS = 3 * 60 * 1_000;

export async function waitForProbeCache(loadCacheFn) {
  const startTime = Date.now();
  const deadline = startTime + CACHE_POLL_MAX_MS;
  logDebug(`🔒 Polling for probe cache (max ${CACHE_POLL_MAX_MS / 1000}s)...`);
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, CACHE_POLL_INTERVAL_MS));
    const cached = loadCacheFn();
    if (cached) {
      logDebug(`🔒 Probe cache appeared after ${Math.round((Date.now() - startTime) / 1000)}s`);
      return cached;
    }
  }
  logDebug(`🔒 Probe cache wait timed out after ${CACHE_POLL_MAX_MS / 1000}s`);
  return null;
}
