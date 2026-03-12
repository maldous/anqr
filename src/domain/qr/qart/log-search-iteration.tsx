import type { FormatVerificationResult } from './validation';
import { log } from './log-3';
import type { BinarySearchValidationResult } from './binary-search-validation-result';

export function logSearchIteration(
  iterations: number,
  mid: number,
  low: number,
  high: number,
  isValid: boolean,
  validation: BinarySearchValidationResult,
  scan: { success: boolean; data?: string },
  formatVerification: FormatVerificationResult | undefined,
  expectedData: string
): void {
  log.debug('Binary search iteration', {
    iteration: iterations,
    vectorsApplied: mid,
    low,
    high,
    hardGatePassed: isValid,
    hardGateFailed: validation.hardGateFailed,
    scans: scan.success,
    byteExactValid: validation.valid || isValid,
    rejectionReason: isValid ? undefined : validation.reason,
    description: isValid ? undefined : validation.description,
    mismatchIndex: validation.mismatchIndex,
    suffixCharsetPenalty: validation.suffixCharsetPenalty,
    ...(formatVerification
      ? {
          formatVerified: formatVerification.valid,
          extractedEcc: formatVerification.extractedEcc,
          extractedMask: formatVerification.extractedMask,
          eccMatch: formatVerification.eccMatch,
          maskMatch: formatVerification.maskMatch,
        }
      : {}),
    ...(scan.success
      ? {
          decodedLength: scan.data?.length,
          originalLength: expectedData.length,
          suffixPreview: scan.data?.slice(expectedData.length)?.slice(0, 20),
        }
      : {}),
  });
}
