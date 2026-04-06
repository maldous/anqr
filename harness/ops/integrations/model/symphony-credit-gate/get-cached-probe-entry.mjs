import { loadProbeCache } from "./load-probe-cache.mjs";

export function getCachedProbeEntry(providerName) {
  const cache = loadProbeCache();
  if (!cache || !Array.isArray(cache.probeResults)) return null;
  return cache.probeResults.find((entry) => entry?.providerName === providerName) || null;
}
