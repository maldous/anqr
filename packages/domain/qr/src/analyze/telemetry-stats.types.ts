export interface AnalysisStats {
  totalAnalyzed: number;
  successRate: number;
  averageConfidence: number;
  versionDistribution: Record<number, number>;
  eccDistribution: Record<string, number>;
  contentTypeDistribution: Record<string, number>;
}
