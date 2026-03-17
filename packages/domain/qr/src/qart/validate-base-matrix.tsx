import type { EliminationResult } from "./elimination";
import { type ECCLevel, type FormatVerificationResult, verifyMatrixFormatInfo } from "./validation";
import { log } from "./log";
import { validateByteExactPrefix } from "./validate-byte-exact-prefix";
import { logBaseValidationFailure } from "./log-base-validation-failure";
import type { BaseMatrixResult } from "./base-matrix-result";
import type { RejectionHistogram, FlattenedSelection } from "./scan-fallback.types";
import { applySubsetAndRegenerate } from "./apply-subset-and-regenerate";

export function validateBaseMatrix(
  flattened: FlattenedSelection[],
  originalBlockData: Uint8Array[],
  originalBlockEcc: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  eliminationResult: EliminationResult,
  regenerateQRFn: (
    blockData: Uint8Array[],
    blockEcc: Uint8Array[],
    blockDataCounts: number[],
    blockEccCounts: number[],
  ) => boolean[][],
  scanQRFn: (matrix: boolean[][]) => { success: boolean; data?: string },
  expectedData: string,
  expectedEcc: ECCLevel | undefined,
  expectedMask: number | undefined,
  strictSuffix: boolean,
  rejectionHistogram: RejectionHistogram,
): BaseMatrixResult {
  const baseResult = applySubsetAndRegenerate(
    flattened,
    0,
    originalBlockData,
    originalBlockEcc,
    blockDataCounts,
    blockEccCounts,
    eliminationResult,
    regenerateQRFn,
  );
  const baseScan = scanQRFn(baseResult.matrix);
  if (!baseScan.success) {
    log.warn("Base matrix (0 vectors) does not scan - this is a fundamental bug");
    return { valid: false, result: baseResult };
  }

  const baseValidation = validateByteExactPrefix(baseScan.data, expectedData, strictSuffix);
  rejectionHistogram.total++;

  if (!baseValidation.valid) {
    logBaseValidationFailure(baseScan.data, expectedData, baseValidation);
    return { valid: false, result: baseResult };
  }

  let baseFormatVerification: FormatVerificationResult | undefined;
  if (expectedEcc !== undefined && expectedMask !== undefined) {
    baseFormatVerification = verifyMatrixFormatInfo(baseResult.matrix, expectedEcc, expectedMask);
    if (!baseFormatVerification.valid) {
      log.warn("Base matrix (0 vectors) FORMAT VERIFICATION FAILED!", {
        rejectionReason: baseFormatVerification.reason,
        expectedEcc,
        extractedEcc: baseFormatVerification.extractedEcc,
        eccMatch: baseFormatVerification.eccMatch,
        expectedMask,
        extractedMask: baseFormatVerification.extractedMask,
        maskMatch: baseFormatVerification.maskMatch,
      });
    }
  }

  rejectionHistogram.ACCEPTED++;

  log.debug("Base matrix (0 vectors) validation PASSED", {
    decodedData: baseScan.data,
    decodedLength: baseScan.data?.length,
    validationMethod: "SEMANTIC_HARD_GATE",
    formatVerified: baseFormatVerification?.valid,
    extractedEcc: baseFormatVerification?.extractedEcc,
    extractedMask: baseFormatVerification?.extractedMask,
    suffixCharsetPenalty: baseValidation.suffixCharsetPenalty,
  });

  return { valid: true, result: baseResult, formatVerification: baseFormatVerification };
}
