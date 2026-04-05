import { MIN_SELECTIONS_FOR_RANKING } from "./min-selections-for-ranking.mjs";
import { LOCAL_SAFETY_NET_PROVIDER_NAMES } from "./local-safety-net-provider-names.mjs";
import { SAFETY_NET_SCORE_CEILING } from "./safety-net-score-ceiling.mjs";
import { SCORE_WEIGHTS } from "./score-weights.mjs";
import { getProviderBootstrapScore } from "./get-provider-bootstrap-score.mjs";
import { getProviderPreferenceBoost } from "./get-provider-preference-boost.mjs";
import { hasHistoricalProviderCapability } from "./has-historical-provider-capability.mjs";

export function calculateProviderScore(providerName, stats) {
  const selections = stats.selections[providerName] || 0;
  const probeEvidence = stats.probeSelections[providerName] || 0;

  if (selections + probeEvidence < MIN_SELECTIONS_FOR_RANKING) {
    if (!hasHistoricalProviderCapability(providerName, stats)) {
      return null;
    }
    return getProviderBootstrapScore(providerName, stats);
  }

  const successes = stats.successes[providerName] || 0;
  const avgDuration = stats.avgDuration[providerName] || 0;
  const validationPasses = stats.validationPasses[providerName] || 0;
  const validationFailures = stats.validationFailures[providerName] || 0;
  const lastSelected = stats.lastSelected[providerName] || stats.lastSuccess[providerName] || 0;
  const successRate = selections > 0 ? successes / selections : 0;
  const durationScore = avgDuration > 0 ? Math.max(0, 1 - avgDuration / 60000) : 0.5;
  const totalValidations = validationPasses + validationFailures;
  const validationRate = totalValidations > 0 ? validationPasses / totalValidations : 0.5;
  const volumeScore = Math.min(1, Math.log10(selections + 1) / 3);
  const ageMs = Date.now() - lastSelected;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - ageDays / 30);
  const linearCompleted = stats.linearCompleted[providerName] || 0;
  const linearFailed = stats.linearFailed[providerName] || 0;
  const linearTotal = linearCompleted + linearFailed;
  const linearCompletionRate = linearTotal > 0 ? linearCompleted / linearTotal : 0.5;
  const highSuccess = stats.linearHighPrioritySuccess[providerName] || 0;
  const highTotal = stats.linearHighPriorityTotal[providerName] || 0;
  const highPrioritySuccessRate = highTotal > 0 ? highSuccess / highTotal : 0.5;
  const mediumSuccess = stats.linearMediumPrioritySuccess[providerName] || 0;
  const mediumTotal = stats.linearMediumPriorityTotal[providerName] || 0;
  const mediumPrioritySuccessRate = mediumTotal > 0 ? mediumSuccess / mediumTotal : 0.5;
  const lowSuccess = stats.linearLowPrioritySuccess[providerName] || 0;
  const lowTotal = stats.linearLowPriorityTotal[providerName] || 0;
  const lowPrioritySuccessRate = lowTotal > 0 ? lowSuccess / lowTotal : 0.5;
  const largeCompleted = stats.largeIssuesCompleted[providerName] || 0;
  const largeTotal = stats.largeIssuesTotal[providerName] || 0;
  const largeIssueSuccessRate = largeTotal > 0 ? largeCompleted / largeTotal : 0.5;
  const totalEst = stats.totalEstimatePoints[providerName] || 0;
  const completedEst = stats.completedEstimatePoints[providerName] || 0;
  const estimateEfficiency = totalEst > 0 ? completedEst / totalEst : 0.5;
  const estimateThroughput = Math.min(1, Math.log10(completedEst + 1) / 4);
  const probeSuccessCount = stats.probeSuccesses[providerName] || 0;
  const probeCapabilityRate = probeEvidence > 0 ? probeSuccessCount / probeEvidence : 0.5;
  const score =
    successRate * SCORE_WEIGHTS.successRate +
    durationScore * SCORE_WEIGHTS.avgDuration +
    validationRate * SCORE_WEIGHTS.validationRate +
    volumeScore * SCORE_WEIGHTS.volume +
    recencyScore * SCORE_WEIGHTS.recency +
    probeCapabilityRate * SCORE_WEIGHTS.probeCapability +
    linearCompletionRate * SCORE_WEIGHTS.linearCompletionRate +
    highPrioritySuccessRate * SCORE_WEIGHTS.linearComplexitySuccess +
    mediumPrioritySuccessRate * SCORE_WEIGHTS.linearComplexitySuccess +
    lowPrioritySuccessRate * SCORE_WEIGHTS.linearSimpleSuccess +
    largeIssueSuccessRate * SCORE_WEIGHTS.estimateSuccessRate +
    estimateEfficiency * SCORE_WEIGHTS.estimateEfficiency +
    estimateThroughput * SCORE_WEIGHTS.estimateThroughput +
    getProviderPreferenceBoost(providerName);
  const rounded = Math.round(Math.min(0.99, score) * 100) / 100;
  if (LOCAL_SAFETY_NET_PROVIDER_NAMES.has(providerName)) {
    return Math.min(rounded, SAFETY_NET_SCORE_CEILING);
  }
  return rounded;
}
