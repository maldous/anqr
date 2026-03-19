import type { QRAnalysisResult } from "@/domain/analyze/types";
import { nowMs } from "./now-ms";

export function withTotalAnalysisTiming(
  result: QRAnalysisResult,
  startedAtMs: number,
): QRAnalysisResult {
  const totalAnalysisMs = Math.round((nowMs() - startedAtMs) * 100) / 100;
  return {
    ...result,
    timing: {
      ...result.timing,
      totalAnalysisMs,
    },
  };
}
