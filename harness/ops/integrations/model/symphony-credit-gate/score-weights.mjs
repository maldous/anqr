export const SCORE_WEIGHTS = {
  successRate: 0.15, // 15% - general success rate
  avgDuration: 0.07, // 7% - faster is better (normalized)
  validationRate: 0.11, // 11% - passes validation
  volume: 0.02, // 2% - more usage = more data
  recency: 0.03, // 3% - recent usage weighted higher
  probeCapability: 0.05, // 5% - tool probe success rate (bootstraps initial scores)

  // Context-size scoring (5%)
  contextLength: 0.05, // 5% - larger context window is better (log-scaled)

  // Probe-vs-usage reliability (3%)
  probeUsageReliability: 0.03, // 3% - penalizes providers where probe succeeds but usage fails

  // Linear issue metrics (50% total)
  linearCompletionRate: 0.13, // 13% - Linear issues completed vs failed
  linearComplexitySuccess: 0.09, // 9% - success rate on complex (high priority) issues
  linearSimpleSuccess: 0.05, // 5% - success rate on simple issues

  // Estimate-based complexity metrics (22%)
  estimateSuccessRate: 0.09, // 9% - completion rate on large (8+) estimate issues
  estimateEfficiency: 0.09, // 9% - avg completed estimate vs attempted
  estimateThroughput: 0.04, // 4% - total estimate points completed
};
