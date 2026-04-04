// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:628

import { recordProviderHealthSuccess } from "../symphony-provider-health.mjs";

import { loadStats } from "./load-stats.mjs";
import { saveStats } from "./save-stats.mjs";

export function recordProviderSuccess(providerName) {
  const stats = loadStats();
  stats.successes[providerName] = (stats.successes[providerName] || 0) + 1;
  stats.lastSuccess[providerName] = Date.now();
  saveStats(stats);
  // Update health state tracking
  recordProviderHealthSuccess(providerName);
}
