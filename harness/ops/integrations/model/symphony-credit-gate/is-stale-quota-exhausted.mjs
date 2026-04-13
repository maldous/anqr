import { loadProbeResults } from "./load-probe-results.mjs";

const STALE_QUOTA_SECS = 24 * 60 * 60; // 24 hours

export function isStaleQuotaExhausted(providerName) {
  const results = loadProbeResults();
  const entry = results[providerName];
  if (!entry) return false;
  if (entry.status !== "quota_exhausted") return false;
  const ts = entry.ts || 0;
  if (!ts) return true; // no timestamp = stale
  const ageSecs = (Date.now() - ts) / 1000;
  return ageSecs > STALE_QUOTA_SECS;
}
