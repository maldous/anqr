import { calculateProviderScore } from "./calculate-provider-score.mjs";
import { loadStats } from "./load-stats.mjs";
import { saveStats } from "./save-stats.mjs";

export function recordProbeResult(providerName, { success, durationMs }) {
  const stats = loadStats();
  stats.probeSelections[providerName] = (stats.probeSelections[providerName] || 0) + 1;
  if (success) {
    stats.probeSuccesses[providerName] = (stats.probeSuccesses[providerName] || 0) + 1;
  } else {
    stats.probeFailures[providerName] = (stats.probeFailures[providerName] || 0) + 1;
  }
  if (typeof durationMs === "number" && durationMs > 0) {
    stats.probeTotalDuration[providerName] =
      (stats.probeTotalDuration[providerName] || 0) + durationMs;
    const probeCount = stats.probeSelections[providerName];
    stats.probeAvgDuration[providerName] =
      probeCount > 0 ? Math.round(stats.probeTotalDuration[providerName] / probeCount) : 0;
  }
  stats.score[providerName] = calculateProviderScore(providerName, stats);
  saveStats(stats);
}
