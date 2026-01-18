/**
 * Analysis Statistics Telemetry
 */

export interface AnalysisStats {
  totalAnalyzed: number;
  successRate: number;
  averageConfidence: number;
  versionDistribution: Record<number, number>;
  eccDistribution: Record<string, number>;
  contentTypeDistribution: Record<string, number>;
}

export function calculateAnalysisStats(
  results: Array<{
    success: boolean;
    confidence?: 'low' | 'medium' | 'high';
    version?: number | null;
    eccLevel?: string | null;
    contentType?: { type: string };
  }>
): AnalysisStats {
  const totalAnalyzed = results.length;
  const successful = results.filter((r) => r.success);
  const successRate = totalAnalyzed > 0 ? successful.length / totalAnalyzed : 0;

  const confidenceMap: Record<string, number> = { low: 0.33, medium: 0.66, high: 1 };
  const confidenceSum = successful.reduce(
    (sum, r) => sum + (confidenceMap[r.confidence ?? 'medium'] ?? 0.66),
    0
  );
  const averageConfidence = successful.length > 0 ? confidenceSum / successful.length : 0;

  const versionDistribution: Record<number, number> = {};
  const eccDistribution: Record<string, number> = {};
  const contentTypeDistribution: Record<string, number> = {};

  for (const result of successful) {
    if (result.version != null) {
      versionDistribution[result.version] = (versionDistribution[result.version] ?? 0) + 1;
    }
    if (result.eccLevel) {
      eccDistribution[result.eccLevel] = (eccDistribution[result.eccLevel] ?? 0) + 1;
    }
    if (result.contentType?.type) {
      contentTypeDistribution[result.contentType.type] =
        (contentTypeDistribution[result.contentType.type] ?? 0) + 1;
    }
  }

  return {
    totalAnalyzed,
    successRate,
    averageConfidence,
    versionDistribution,
    eccDistribution,
    contentTypeDistribution,
  };
}

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
