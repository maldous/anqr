import type { AnalysisIssue } from "./analysis-issue";
import type { AnalysisWarning } from "./analysis-warning";
import type { ContrastReport } from "./contrast-report";

export interface AnalysisResult {
  valid: boolean;
  scannable: boolean;
  warnings: AnalysisWarning[];
  issues: AnalysisIssue[];
  contrast: ContrastReport | null;
  moduleSize: number | null;
  quietZone: number | null;
}
