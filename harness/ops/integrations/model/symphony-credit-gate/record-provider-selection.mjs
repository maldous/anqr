import { loadStats } from "./load-stats.mjs";
import { saveStats } from "./save-stats.mjs";

export function recordProviderSelection(providerName) {
  const stats = loadStats();
  stats.selections[providerName] = (stats.selections[providerName] || 0) + 1;
  stats.lastSelected[providerName] = Date.now();
  if (!stats.firstUsed[providerName]) {
    stats.firstUsed[providerName] = Date.now();
  }
  saveStats(stats);
}
