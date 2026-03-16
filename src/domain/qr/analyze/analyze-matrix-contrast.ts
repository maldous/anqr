import type { ContrastReport } from "./safety.types";
import { analyzeContrast } from "./analyze-contrast";

/**
 * Analyze contrast from a QR matrix
 */
export function analyzeMatrixContrast(
  _matrix: boolean[][],
  fgColor: string,
  bgColor: string,
): ContrastReport {
  return analyzeContrast(fgColor, bgColor);
}
