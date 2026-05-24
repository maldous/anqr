import { BRIDGE_STATE } from "./constants.mjs";
import { loadJson } from "./load-json.mjs";

export function getBridgeStats() {
  const stats = loadJson(`${BRIDGE_STATE}/provider-stats.json`);
  const health = loadJson(`${BRIDGE_STATE}/provider-health.json`);
  const cache = loadJson(`${BRIDGE_STATE}/provider-probe-cache.json`);
  if (!stats) return null;
  const h = health || {};
  const sel = stats.selections || {};
  const totalCalls = Object.values(sel).reduce((a, b) => a + b, 0);
  return { totalCalls,
    healthyProviders: Object.values(h).filter(v => v.state === "healthy").length,
    degradedProviders: Object.values(h).filter(v => v.state !== "healthy").length,
    availableProviders: (cache?.probeResults || []).filter(r => r.available).length,
    totalConfigured: (cache?.probeResults || []).length, lastProbe: cache?.lastProbeAt };
}
