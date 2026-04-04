import { calculateProviderScore } from "./calculate-provider-score.mjs";
import { loadStats } from "./load-stats.mjs";
import { saveStats } from "./save-stats.mjs";

export function recordProviderFailureCount(providerName) {
  const stats = loadStats();
  stats.failures[providerName] = (stats.failures[providerName] || 0) + 1;
  stats.lastFailure[providerName] = Date.now();
  stats.score[providerName] = calculateProviderScore(providerName, stats);
  saveStats(stats);
}
