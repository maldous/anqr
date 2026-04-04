import { TIER_FREE } from "./tier-free.mjs";
import { TIER_LOCAL } from "./tier-local.mjs";
import { TIER_PAID } from "./tier-paid.mjs";
import { loadAdaptiveParams } from "./load-adaptive-params.mjs";
import { saveAdaptiveParams } from "./save-adaptive-params.mjs";
import { logInfo } from "./logger.mjs";

export function tuneAdaptiveParams(providerStats) {
  const params = loadAdaptiveParams();
  const now = Date.now();

  // Only tune every N requests
  params.samplingRate.counter++;
  if (params.samplingRate.counter < params.lastTuningAt + params.tuningInterval) {
    return params;
  }

  logInfo(`[session-state] 🎯 Self-tuning adaptive parameters...`);

  let tuned = 0;

  for (const [providerName, stats] of Object.entries(providerStats)) {
    const tier = stats.tier || TIER_FREE;
    if (tier === TIER_PAID || tier === TIER_LOCAL) continue; // Don't tune paid or local

    const selections = stats.selections || 0;
    if (selections < 10) continue; // Not enough data

    const successRate = Number.parseFloat(stats.successRate) / 100 || 0;
    const linearRate = Number.parseFloat(stats.linearCompletionRate) / 100 || 0.5;

    const currentLimit =
      params.freeTurnLimit.perProvider[providerName] || params.freeTurnLimit.base;

    // If provider is performing well (>80% success), increase turn limit
    if (successRate > 0.8 && linearRate > 0.7) {
      const newLimit = Math.min(Math.round(currentLimit * 1.2), params.freeTurnLimit.max);
      if (newLimit !== currentLimit) {
        params.freeTurnLimit.perProvider[providerName] = newLimit;
        logInfo(
          `[session-state]   ⬆️ ${providerName}: ${currentLimit} → ${newLimit} turns (high success)`,
        );
        tuned++;
      }
    }

    // If provider is underperforming (<60% success), decrease turn limit
    if (successRate < 0.6 || linearRate < 0.4) {
      const newLimit = Math.max(Math.round(currentLimit * 0.8), params.freeTurnLimit.min);
      if (newLimit !== currentLimit) {
        params.freeTurnLimit.perProvider[providerName] = newLimit;
        logInfo(
          `[session-state]   ⬇️ ${providerName}: ${currentLimit} → ${newLimit} turns (low success)`,
        );
        tuned++;
      }
    }
  }

  params.lastTuningAt = now;
  saveAdaptiveParams(params);

  if (tuned > 0) {
    logInfo(`[session-state] ✅ Tuned ${tuned} provider turn limits`);
  } else {
    logInfo(`[session-state] ✅ No tuning needed (all providers stable)`);
  }

  return params;
}
