import { disableLogBuffer, flushLogBuffer } from "../../../../observability/logging/src";
import type { ErrorType, QRAnalysisResult } from "@/domain/analyze/types";
import { elapsedMs } from "./elapsed-ms";

export function buildDecodeFailure(
  error: string,
  errorType: ErrorType,
  decodeStartMs: number,
): QRAnalysisResult {
  const debugLog = flushLogBuffer();
  disableLogBuffer();
  return {
    success: false,
    error,
    errorType,
    version: null,
    moduleCount: 0,
    eccLevel: null,
    maskPattern: null,
    encodingMode: null,
    errorsCorrected: null,
    estimatedModulePx: null,
    timing: { decodeMs: elapsedMs(decodeStartMs) },
    debugLog,
  };
}
