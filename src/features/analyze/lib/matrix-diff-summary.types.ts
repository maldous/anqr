export interface MatrixDiffSummary {
  rows: number;
  cols: number;
  diffCount: number;
  diffPct: number;
  firstDiff: { row: number; col: number; a: boolean; b: boolean } | null;
}
