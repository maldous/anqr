import { decodeQRFromCanvas } from "./decoder";
import type { QRAnalysisResult } from "../../../modules/qr-analyzer/types";
import { nowMs } from "./now-ms";
import { withTotalAnalysisTiming } from "./with-total-analysis-timing";

export function analyzeQRSync(canvas: HTMLCanvasElement): QRAnalysisResult {
  const startedAtMs = nowMs();
  const result = decodeQRFromCanvas(canvas);
  return withTotalAnalysisTiming(result, startedAtMs);
}
