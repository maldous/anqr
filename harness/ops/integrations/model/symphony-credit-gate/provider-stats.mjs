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

  // Context-size tracking (populated from provider catalogs and refreshed dynamically)
  contextLength: {}, // current known context window (tokens) per provider
  contextLengthUpdatedAt: {}, // timestamp of last context-size refresh per provider
  contextLengthSource: {}, // "catalog" | "api" | "static" | "unknown" per provider

  // Probe-vs-usage reliability (tracks gap between probe success and real usage success)
  usageSuccesses: {}, // real usage succeeded (not just probe)
  usageFailures: {}, // real usage failed after probe succeeded
};
