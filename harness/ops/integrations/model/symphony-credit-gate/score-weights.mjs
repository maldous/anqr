export const SCORE_WEIGHTS = {
  successRate: 0.15, // 15% - general success rate
  avgDuration: 0.08, // 8% - faster is better (normalized)
  validationRate: 0.12, // 12% - passes validation
  volume: 0.02, // 2% - more usage = more data
  recency: 0.03, // 3% - recent usage weighted higher
  probeCapability: 0.05, // 5% - tool probe success rate (bootstraps initial scores)

  // Linear issue metrics (55% total)
  linearCompletionRate: 0.15, // 15% - Linear issues completed vs failed
  linearComplexitySuccess: 0.1, // 10% - success rate on complex (high priority) issues
  linearSimpleSuccess: 0.05, // 5% - success rate on simple issues

  // Estimate-based complexity metrics (25%)
  estimateSuccessRate: 0.1, // 10% - completion rate on large (8+) estimate issues
  estimateEfficiency: 0.1, // 10% - avg completed estimate vs attempted
  estimateThroughput: 0.05, // 5% - total estimate points completed
};
