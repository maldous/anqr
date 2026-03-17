import type { MatrixDiffSummary } from "./matrix-diff-summary.types";
import type { MatrixShiftSummary } from "./matrix-shift-summary.types";

export interface MatrixDiagnostics {
  regenVsDecoded: MatrixDiffSummary | null;
  regenVsOriginal: MatrixDiffSummary | null;
  bestShift: MatrixShiftSummary | null;
}
