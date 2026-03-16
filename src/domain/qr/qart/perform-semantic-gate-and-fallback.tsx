import type { ECCLevel } from "./bit-mapping";
import type { BlockSelectionResult, EliminationResult } from "./elimination";
import { extractFormatInfo } from "./validation";
import { performSemanticValidation } from "./perform-semantic-validation";
import { log } from "./log";
import { validateTimingPatterns } from "./validate-timing-patterns";
import { validateFinderPatterns } from "./validate-finder-patterns";
import { scanMatrixWithJsQR } from "./scan-matrix-with-js-qr";
import { handleScanFailureFallback } from "./handle-scan-failure-fallback";
import { evaluateSemanticGateResult } from "./evaluate-semantic-gate-result";
import type { ScanResult } from "./scan-result";

export function performSemanticGateAndFallback(
  finalMatrix: boolean[][],
  baseMatrix: boolean[][],
  originalData: string,
  data: string,
  encodedData: string,
  ecc: ECCLevel,
  actualMask: number,
  actualSuffix: string,
  strictSuffix: boolean,
  resolvedSuffixMode: "byte" | "numeric",
  originalDataLength: number,
  scanResult: ScanResult,
  blockSelections: BlockSelectionResult[],
  elimination: EliminationResult,
  importance: number[][],
  moduleCount: number,
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  totalSelected: number,
  diagnostics: {
    structuralDiffCount: number;
    dataDiffCount: number;
    finderValidation: ReturnType<typeof validateFinderPatterns>;
    timingValidation: ReturnType<typeof validateTimingPatterns>;
    baseFormatInfo: ReturnType<typeof extractFormatInfo>;
    finalFormatInfo: ReturnType<typeof extractFormatInfo>;
  },
  actualControlPercentage: number,
  basisVectorCount: number,
): { finalMatrixToUse: boolean[][]; actualVectorsApplied: number } {
  const semanticValidation = performSemanticValidation(
    finalMatrix,
    originalData,
    ecc,
    actualMask,
    actualSuffix,
    scanMatrixWithJsQR,
    strictSuffix,
    resolvedSuffixMode,
  );

  const currentScanResult = evaluateSemanticGateResult(
    semanticValidation,
    scanResult,
    data,
    originalDataLength,
    ecc,
    actualMask,
    strictSuffix,
  );

  let finalMatrixToUse = finalMatrix;
  let actualVectorsApplied = totalSelected;

  if (!currentScanResult.success) {
    log.warn("QR-Art matrix scan validation FAILED - matrix does not scan!", {
      error: currentScanResult.error,
      expectedData: encodedData,
      scanAttempts: currentScanResult.attempts,
      finderPatternsOK: diagnostics.finderValidation.allValid,
      timingPatternsOK: diagnostics.timingValidation.allValid,
      formatInfoOK: diagnostics.baseFormatInfo.vertical === diagnostics.finalFormatInfo.vertical,
      structuralDiffsCount: diagnostics.structuralDiffCount,
      dataDiffsCount: diagnostics.dataDiffCount,
      controllableVectors: basisVectorCount,
      controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
    });

    const fallbackResult = handleScanFailureFallback(
      blockSelections,
      elimination,
      importance,
      moduleCount,
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      actualVersion,
      ecc,
      actualMask,
      data,
      actualSuffix,
      strictSuffix,
      totalSelected,
      baseMatrix,
    );

    finalMatrixToUse = fallbackResult.matrix;
    actualVectorsApplied = fallbackResult.vectorsApplied;
  }

  return { finalMatrixToUse, actualVectorsApplied };
}
