import { disableLogBuffer, flushLogBuffer } from "../../../infra/logging/logger";
import type { ErrorType, QRAnalysisResult } from "../../../modules/qr-analyzer/types";
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
