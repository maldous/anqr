// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:70

export const PROVIDER_STATS = {
  // Basic counts
  selections: {},
  successes: {},
  failures: {},

  // Timing metrics (in ms)
  metricSamples: {},
  totalDuration: {},
  avgDuration: {},
  minDuration: {},
  maxDuration: {},

  // Token metrics
  totalInputTokens: {},
  totalOutputTokens: {},
  avgInputTokens: {},
  avgOutputTokens: {},

  // Quality metrics
  validationPasses: {},
  validationFailures: {},

  // Timestamps
  lastSelected: {},
  lastSuccess: {},
  lastFailure: {},
  firstUsed: {},

  // Score (dynamic ranking)
  score: {},

  // Linear issue completion metrics (per complexity level)
  linearCompleted: {},
  linearFailed: {},
  linearHighPrioritySuccess: {},
  linearHighPriorityTotal: {},
  linearMediumPrioritySuccess: {},
  linearMediumPriorityTotal: {},
  linearLowPrioritySuccess: {},
  linearLowPriorityTotal: {},

  // Estimate-based complexity tracking
  totalEstimatePoints: {},
  avgEstimatePoints: {},
  completedEstimatePoints: {},

  // Complexity breakdown by estimate ranges
  smallIssuesCompleted: {},
  smallIssuesTotal: {},
  mediumIssuesCompleted: {},
  mediumIssuesTotal: {},
  largeIssuesCompleted: {},
  largeIssuesTotal: {},

  // Probe metrics (separate from runtime to avoid contamination)
  probeSelections: {},
  probeSuccesses: {},
  probeFailures: {},
  probeTotalDuration: {},
  probeAvgDuration: {},
};
