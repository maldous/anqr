import { BRIDGE_STATE } from "./constants.mjs";
import { loadJson } from "./load-json.mjs";

export function getModelsData() {
  const stats = loadJson(`${BRIDGE_STATE}/provider-stats.json`);
  const cache = loadJson(`${BRIDGE_STATE}/provider-probe-cache.json`);
  const health = loadJson(`${BRIDGE_STATE}/provider-health.json`);
  if (!stats && !cache) return { ranked: [], totalAvailable: 0, totalConfigured: 0, error: "bridge state unavailable" };
  const probeResults = cache?.probeResults || [];
  const availSet = new Set(probeResults.filter(r => r.available).map(r => r.name));
  const probeMap = Object.fromEntries(probeResults.map(r => [r.name, r]));
  const healthMap = health || {};
  const sel = stats?.selections || {};
  const totalCalls = Object.values(sel).reduce((a, b) => a + b, 0);
  const ranked = Object.entries(sel)
    .map(([name, count]) => {
      const h = healthMap[name] || {};
      const probe = probeMap[name] || {};
      return { name, count, pct: totalCalls ? Math.round(count / totalCalls * 1000) / 10 : 0,
        available: availSet.has(name), healthState: h.state || "unknown",
        consecutiveFailures: h.consecutiveFailures || 0, consecutiveSuccesses: h.consecutiveSuccesses || 0,
        probeDurationMs: probe.durationMs || null };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);
  return { ranked, totalCalls, totalAvailable: availSet.size,
    totalConfigured: probeResults.length, totalTracked: Object.keys(sel).length,
    lastProbe: cache?.lastProbeAt,
    degradedProviders: Object.values(healthMap).filter(v => v.state !== "healthy").length };
}
