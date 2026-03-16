import { decodeQRFromCanvas } from "./decoder";
import type { QRAnalysisResult } from "../../../modules/qr-analyzer/types";
import { loadFileImageCanvas } from "./load-file-image-canvas";
import { nowMs } from "./now-ms";
import { withTotalAnalysisTiming } from "./with-total-analysis-timing";

/**
 * Analyze a QR code from a File
 */
export async function analyzeQRFromFile(file: File): Promise<QRAnalysisResult> {
  const startedAtMs = nowMs();
  const canvasResult = await loadFileImageCanvas(file);
  if (canvasResult.error === null) {
    return withTotalAnalysisTiming(decodeQRFromCanvas(canvasResult.canvas), startedAtMs);
  }

  const errorMessage =
    canvasResult.error === "context"
      ? "Could not get canvas context"
      : canvasResult.error === "load"
        ? "Failed to load image"
        : "Failed to read file";

  return withTotalAnalysisTiming(
    {
      success: false,
      error: errorMessage,
      errorType: "unknown",
      version: null,
      moduleCount: 0,
      eccLevel: null,
      maskPattern: null,
      encodingMode: null,
      errorsCorrected: null,
      estimatedModulePx: null,
    },
    startedAtMs,
  );
}
