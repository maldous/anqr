import { MIN_SELECTIONS_FOR_RANKING } from "./min-selections-for-ranking.mjs";
import { LOCAL_SAFETY_NET_PROVIDER_NAMES } from "./local-safety-net-provider-names.mjs";
import { SAFETY_NET_SCORE_CEILING } from "./safety-net-score-ceiling.mjs";
import { SCORE_WEIGHTS } from "./score-weights.mjs";

export function calculateProviderScore(providerName, stats) {
  const selections = stats.selections[providerName] || 0;
  const probeEvidence = stats.probeSelections[providerName] || 0;

  // Not enough data yet — probe evidence can bootstrap initial ranking
  if (selections + probeEvidence < MIN_SELECTIONS_FOR_RANKING) {
    return null; // Not ranked yet
  }

  const successes = stats.successes[providerName] || 0;
  const avgDuration = stats.avgDuration[providerName] || 0;
  const validationPasses = stats.validationPasses[providerName] || 0;
  const validationFailures = stats.validationFailures[providerName] || 0;
  const lastSelected = stats.lastSelected[providerName] || 0;

  // 1. Success Rate (0-1)
  const successRate = selections > 0 ? successes / selections : 0;

  // 2. Avg Duration (normalized - lower is better, invert)
  // Use a baseline of 60s as "slow", anything faster gets higher score
  const durationScore = avgDuration > 0 ? Math.max(0, 1 - avgDuration / 60000) : 0.5;

  // 3. Validation Rate (0-1)
  const totalValidations = validationPasses + validationFailures;
  const validationRate = totalValidations > 0 ? validationPasses / totalValidations : 0.5;

  // 4. Volume (normalized - use log scale to prevent dominance)
  const volumeScore = Math.min(1, Math.log10(selections + 1) / 3); // Maxes at 1000 selections

  // 5. Recency (0-1 - more recent = higher)
  const now = Date.now();
  const ageMs = now - lastSelected;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - ageDays / 30); // Decay over 30 days

  // 6. Linear Issue Completion Rate (0-1)
  const linearCompleted = stats.linearCompleted[providerName] || 0;
  const linearFailed = stats.linearFailed[providerName] || 0;
  const linearTotal = linearCompleted + linearFailed;
  const linearCompletionRate = linearTotal > 0 ? linearCompleted / linearTotal : 0.5;

  // 7. High Priority (Complex) Issue Success Rate (0-1)
  const highSuccess = stats.linearHighPrioritySuccess[providerName] || 0;
  const highTotal = stats.linearHighPriorityTotal[providerName] || 0;
  const highPrioritySuccessRate = highTotal > 0 ? highSuccess / highTotal : 0.5;

  // 8. Medium Priority Issue Success Rate (0-1)
  const mediumSuccess = stats.linearMediumPrioritySuccess[providerName] || 0;
  const mediumTotal = stats.linearMediumPriorityTotal[providerName] || 0;
  const mediumPrioritySuccessRate = mediumTotal > 0 ? mediumSuccess / mediumTotal : 0.5;

  // 9. Low Priority (Simple) Issue Success Rate (0-1)
  const lowSuccess = stats.linearLowPrioritySuccess[providerName] || 0;
  const lowTotal = stats.linearLowPriorityTotal[providerName] || 0;
  const lowPrioritySuccessRate = lowTotal > 0 ? lowSuccess / lowTotal : 0.5;

  // 10. Large Issue (8+ points) Success Rate (0-1)
  const largeCompleted = stats.largeIssuesCompleted[providerName] || 0;
  const largeTotal = stats.largeIssuesTotal[providerName] || 0;
  const largeIssueSuccessRate = largeTotal > 0 ? largeCompleted / largeTotal : 0.5;

  // 11. Estimate Efficiency - ratio of completed estimate points to attempted
  const totalEst = stats.totalEstimatePoints[providerName] || 0;
  const completedEst = stats.completedEstimatePoints[providerName] || 0;
  const estimateEfficiency = totalEst > 0 ? completedEst / totalEst : 0.5;

  // 12. Estimate Throughput - log scale of total completed estimate points
  const estimateThroughput = Math.min(1, Math.log10(completedEst + 1) / 4); // Maxes at 10k points

  // 13. Probe Capability (0-1) — from tool probe results, separate from runtime
  const probeSuccessCount = stats.probeSuccesses[providerName] || 0;
  const probeCapabilityRate = probeEvidence > 0 ? probeSuccessCount / probeEvidence : 0.5;

  // Weighted combination
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
    estimateThroughput * SCORE_WEIGHTS.estimateThroughput;

  const rounded = Math.round(score * 100) / 100;

  // Apply tier-based score ceiling — safety-net providers are capped to prevent
  // them from outranking cloud providers through accumulated local-only stats.
  if (LOCAL_SAFETY_NET_PROVIDER_NAMES.has(providerName)) {
    return Math.min(rounded, SAFETY_NET_SCORE_CEILING);
  }

  return rounded;
}
