import type { QRAnalysisResult } from "@/domain/analyze/types";
import { analyzeQRSync } from "./analyze-qr-sync";

/**
 * Analyze a QR code with full safety analysis (synchronous, for camera capture)
 */
export function analyzeQRCode(canvas: HTMLCanvasElement): QRAnalysisResult {
  return analyzeQRSync(canvas);
}
