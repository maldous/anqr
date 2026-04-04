// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1021

import { PROVIDERS } from "./providers.mjs";
import { TIER_FREE_CLOUD } from "./tier-free-cloud.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";
import { loadStats } from "./load-stats.mjs";

export function getProviderStats(options = {}) {
  const includeAllProviders = options.includeAllProviders !== false;
  const stats = loadStats();
  const result = {};

  // Build list of providers to include
  const providerNames = new Set(Object.keys(stats.selections));
  // Also include providers with probe data (may have no runtime selections yet)
  for (const name of Object.keys(stats.probeSelections || {})) {
    providerNames.add(name);
  }
  if (includeAllProviders) {
    // Include all providers from PROVIDERS list, even if never selected
    for (const provider of PROVIDERS) {
      providerNames.add(provider.name);
    }
  }

  for (const name of providerNames) {
    const selected = stats.selections[name] || 0;
    const success = stats.successes[name] || 0;
    const fail = stats.failures[name] || 0;
    const rate = selected > 0 ? ((success / selected) * 100).toFixed(1) : 0;

    // Calculate validation rate
    const validationPasses = stats.validationPasses[name] || 0;
    const validationFailures = stats.validationFailures[name] || 0;
    const totalValidations = validationPasses + validationFailures;
    const validationRate =
      totalValidations > 0 ? ((validationPasses / totalValidations) * 100).toFixed(1) + "%" : "N/A";

    // Calculate Linear completion rates
    const linearCompleted = stats.linearCompleted[name] || 0;
    const linearFailed = stats.linearFailed[name] || 0;
    const linearTotal = linearCompleted + linearFailed;
    const linearCompletionRate =
      linearTotal > 0 ? ((linearCompleted / linearTotal) * 100).toFixed(1) + "%" : "N/A";

    const highSuccess = stats.linearHighPrioritySuccess[name] || 0;
    const highTotal = stats.linearHighPriorityTotal[name] || 0;
    const highPriorityRate =
      highTotal > 0 ? ((highSuccess / highTotal) * 100).toFixed(1) + "%" : "N/A";

    const medSuccess = stats.linearMediumPrioritySuccess[name] || 0;
    const medTotal = stats.linearMediumPriorityTotal[name] || 0;
    const medPriorityRate = medTotal > 0 ? ((medSuccess / medTotal) * 100).toFixed(1) + "%" : "N/A";

    const lowSuccess = stats.linearLowPrioritySuccess[name] || 0;
    const lowTotal = stats.linearLowPriorityTotal[name] || 0;
    const lowPriorityRate = lowTotal > 0 ? ((lowSuccess / lowTotal) * 100).toFixed(1) + "%" : "N/A";

    // Estimate-based metrics
    const totalEst = stats.totalEstimatePoints[name] || 0;
    const completedEst = stats.completedEstimatePoints[name] || 0;
    const avgEst = stats.avgEstimatePoints[name] || 0;
    const estEfficiency = totalEst > 0 ? ((completedEst / totalEst) * 100).toFixed(1) + "%" : "N/A";

    const largeCompleted = stats.largeIssuesCompleted[name] || 0;
    const largeTotal = stats.largeIssuesTotal[name] || 0;
    const largeRate =
      largeTotal > 0 ? ((largeCompleted / largeTotal) * 100).toFixed(1) + "%" : "N/A";

    const provider = PROVIDERS.find((p) => p.name === name);
    const tier = provider ? getProviderTier(provider) : TIER_FREE_CLOUD;

    const probeSelected = stats.probeSelections[name] || 0;
    const probeSuccess = stats.probeSuccesses[name] || 0;
    const probeFail = stats.probeFailures[name] || 0;
    const probeAvgDur = stats.probeAvgDuration[name] || 0;

    result[name] = {
      tier,
      // Basic counts
      selections: selected,
      successes: success,
      failures: fail,
      successRate: `${rate}%`,

      // Timing
      avgDurationMs: stats.avgDuration[name] || 0,
      minDurationMs: stats.minDuration[name] || null,
      maxDurationMs: stats.maxDuration[name] || null,

      // Tokens
      avgInputTokens: stats.avgInputTokens[name] || 0,
      avgOutputTokens: stats.avgOutputTokens[name] || 0,
      totalInputTokens: stats.totalInputTokens[name] || 0,
      totalOutputTokens: stats.totalOutputTokens[name] || 0,

      // Validation
      validationPasses,
      validationFailures,
      validationRate,

      // Linear issue completion (by complexity)
      linearCompleted,
      linearFailed,
      linearCompletionRate,
      linearHighPrioritySuccess: highSuccess,
      linearHighPriorityTotal: highTotal,
      highPrioritySuccessRate: highPriorityRate,
      linearMediumPrioritySuccess: medSuccess,
      linearMediumPriorityTotal: medTotal,
      mediumPrioritySuccessRate: medPriorityRate,
      linearLowPrioritySuccess: lowSuccess,
      linearLowPriorityTotal: lowTotal,
      lowPrioritySuccessRate: lowPriorityRate,

      // Estimate-based metrics
      totalEstimatePoints: totalEst,
      completedEstimatePoints: completedEst,
      avgEstimatePoints: avgEst,
      estimateEfficiency: estEfficiency,
      largeIssuesCompleted: largeCompleted,
      largeIssuesTotal: largeTotal,
      largeIssueSuccessRate: largeRate,

      // Score
      score: stats.score[name] === null ? "pending" : stats.score[name], // null = not enough data

      // Probe metrics (separate from runtime)
      probeSelections: probeSelected,
      probeSuccesses: probeSuccess,
      probeFailures: probeFail,
      probeAvgDurationMs: probeAvgDur,

      // Timestamps
      lastSelected: stats.lastSelected[name]
        ? new Date(stats.lastSelected[name]).toISOString()
        : null,
      lastSuccess: stats.lastSuccess[name] ? new Date(stats.lastSuccess[name]).toISOString() : null,
      lastFailure: stats.lastFailure[name] ? new Date(stats.lastFailure[name]).toISOString() : null,
      firstUsed: stats.firstUsed[name] ? new Date(stats.firstUsed[name]).toISOString() : null,
    };
  }
  return result;
}
