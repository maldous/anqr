import { providerStatusCache } from "./provider-status-cache.mjs";

export function applyCacheToStatus(cached) {
  providerStatusCache.configured = cached.configured;
  providerStatusCache.probeResults = cached.probeResults;
  providerStatusCache.lastProbeAt = cached.lastProbeAt;
}
