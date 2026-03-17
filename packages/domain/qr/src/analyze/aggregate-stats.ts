import type { AnalysisStats } from "./telemetry-stats.types";

export function aggregateStats(statsArray: AnalysisStats[]): AnalysisStats {
  if (statsArray.length === 0) {
    return {
      totalAnalyzed: 0,
      successRate: 0,
      averageConfidence: 0,
      versionDistribution: {},
      eccDistribution: {},
      contentTypeDistribution: {},
    };
  }

  const totalAnalyzed = statsArray.reduce((sum, s) => sum + s.totalAnalyzed, 0);
  const weightedSuccessRate =
    statsArray.reduce((sum, s) => sum + s.successRate * s.totalAnalyzed, 0) / totalAnalyzed;
  const weightedConfidence =
    statsArray.reduce((sum, s) => sum + s.averageConfidence * s.totalAnalyzed, 0) / totalAnalyzed;

  const versionDistribution: Record<number, number> = {};
  const eccDistribution: Record<string, number> = {};
  const contentTypeDistribution: Record<string, number> = {};

  for (const stats of statsArray) {
    for (const [k, v] of Object.entries(stats.versionDistribution)) {
      versionDistribution[Number(k)] = (versionDistribution[Number(k)] ?? 0) + v;
    }
    for (const [k, v] of Object.entries(stats.eccDistribution)) {
      eccDistribution[k] = (eccDistribution[k] ?? 0) + v;
    }
    for (const [k, v] of Object.entries(stats.contentTypeDistribution)) {
      contentTypeDistribution[k] = (contentTypeDistribution[k] ?? 0) + v;
    }
  }

  return {
    totalAnalyzed,
    successRate: weightedSuccessRate,
    averageConfidence: weightedConfidence,
    versionDistribution,
    eccDistribution,
    contentTypeDistribution,
  };
}
