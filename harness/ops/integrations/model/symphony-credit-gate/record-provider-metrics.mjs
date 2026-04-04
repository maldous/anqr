// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:761

import { calculateProviderScore } from "./calculate-provider-score.mjs";
import { loadStats } from "./load-stats.mjs";
import { saveStats } from "./save-stats.mjs";

export function recordProviderMetrics(
  providerName,
  { durationMs, inputTokens, outputTokens, validationPassed },
) {
  const stats = loadStats();
  stats.metricSamples[providerName] = (stats.metricSamples[providerName] || 0) + 1;
  const metricSamples = stats.metricSamples[providerName];

  // Timing
  stats.totalDuration[providerName] = (stats.totalDuration[providerName] || 0) + durationMs;
  stats.avgDuration[providerName] =
    metricSamples > 0 ? Math.round(stats.totalDuration[providerName] / metricSamples) : 0;

  const prevMin = stats.minDuration[providerName];
  stats.minDuration[providerName] = prevMin ? Math.min(prevMin, durationMs) : durationMs;

  const prevMax = stats.maxDuration[providerName];
  stats.maxDuration[providerName] = prevMax ? Math.max(prevMax, durationMs) : durationMs;

  // Tokens
  stats.totalInputTokens[providerName] =
    (stats.totalInputTokens[providerName] || 0) + (inputTokens || 0);
  stats.totalOutputTokens[providerName] =
    (stats.totalOutputTokens[providerName] || 0) + (outputTokens || 0);
  stats.avgInputTokens[providerName] =
    metricSamples > 0 ? Math.round(stats.totalInputTokens[providerName] / metricSamples) : 0;
  stats.avgOutputTokens[providerName] =
    metricSamples > 0 ? Math.round(stats.totalOutputTokens[providerName] / metricSamples) : 0;

  // Validation
  if (validationPassed) {
    stats.validationPasses[providerName] = (stats.validationPasses[providerName] || 0) + 1;
  } else {
    stats.validationFailures[providerName] = (stats.validationFailures[providerName] || 0) + 1;
  }

  // Recalculate score
  stats.score[providerName] = calculateProviderScore(providerName, stats);

  saveStats(stats);
}
