import type { MatrixDiffSummary } from "./matrix-diff-summary.type";
import type { MatrixShiftSummary } from "./matrix-shift-summary.type";

export interface MatrixDiagnostics {
  regenVsDecoded: MatrixDiffSummary | null;
  regenVsOriginal: MatrixDiffSummary | null;
  bestShift: MatrixShiftSummary | null;
}
