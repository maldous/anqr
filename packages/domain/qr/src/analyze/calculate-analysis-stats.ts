import type { AnalysisStats } from "./telemetry-stats.types";

export function calculateAnalysisStats(
  results: Array<{
    success: boolean;
    confidence?: "low" | "medium" | "high";
    version?: number | null;
    eccLevel?: string | null;
    contentType?: { type: string };
  }>,
): AnalysisStats {
  const totalAnalyzed = results.length;
  const successful = results.filter((r) => r.success);
  const successRate = totalAnalyzed > 0 ? successful.length / totalAnalyzed : 0;

  const confidenceMap: Record<string, number> = { low: 0.33, medium: 0.66, high: 1 };
  const confidenceSum = successful.reduce(
    (sum, r) => sum + (confidenceMap[r.confidence ?? "medium"] ?? 0.66),
    0,
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
