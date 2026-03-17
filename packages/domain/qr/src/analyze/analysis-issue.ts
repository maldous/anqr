export interface AnalysisIssue {
  type: string;
  message: string;
  location?: { x: number; y: number };
}
