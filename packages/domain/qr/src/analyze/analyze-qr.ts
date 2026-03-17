import { scanCanvas } from "./scanner";
import type { AnalysisResult, AnalysisWarning, AnalysisIssue } from "./safety.types";

/**
 * Comprehensive QR analysis
 */
export function analyzeQR(canvas: HTMLCanvasElement, expectedContent?: string): AnalysisResult {
  const warnings: AnalysisWarning[] = [];
  const issues: AnalysisIssue[] = [];

  // Try to scan
  const scanResult = scanCanvas(canvas);
  const scannable = !!scanResult;

  if (!scannable) {
    issues.push({
      type: "scan_failed",
      message: "QR code could not be scanned",
    });
  } else if (expectedContent && scanResult.data !== expectedContent) {
    issues.push({
      type: "content_mismatch",
      message: `Scanned content does not match expected: got "${scanResult.data}"`,
    });
  }

  return {
    valid: scannable && (!expectedContent || scanResult?.data === expectedContent),
    scannable,
    warnings,
    issues,
    contrast: null,
    moduleSize: null,
    quietZone: null,
  };
}
