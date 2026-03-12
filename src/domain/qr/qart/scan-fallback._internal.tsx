/**
 * QR-Art Scan Fallback Module
 *
 * Implements binary search fallback to find the maximum number of
 * basis vectors that can be applied while keeping the QR scannable.
 *
 * When applying all selected vectors produces an unscannable QR code,
 * this module uses binary search to find the optimal subset of vectors
 * that maximizes image quality while maintaining scannability.
 *
 * HYBRID ACCEPTANCE CRITERIA:
 * - Decoder must successfully scan (success=true)
 * - Decoded data must be long enough (length >= originalLength)
 * - First N bytes must match exactly (byte-exact comparison)
 */

import { createLogger } from '../../../infra/logging/logger';
import type {
  BlockEliminationResult,
  BlockSelectionResult,
  EliminationResult,
} from './elimination';
import { applySelectedVectorsToBlock } from './elimination';
import type { RSBasisVector } from './rs-basis';
import {
  type ECCLevel,
  type FormatVerificationResult,
  type RejectionReason,
  validateSuffixCharset,
  verifyMatrixFormatInfo,
} from './validation';

/**
 * Create an empty rejection histogram
 */
export function createRejectionHistogram(): RejectionHistogram {
  return {
    SCAN_FAILED: 0,
    LENGTH_TOO_SHORT: 0,
    BYTE_MISMATCH: 0,
    ECC_MISMATCH: 0,
    MASK_MISMATCH: 0,
    SUFFIX_CHARSET_INVALID: 0,
    ACCEPTED: 0,
    total: 0,
  };
}

export const log = createLogger('QART');

/**
 * Result of binary search validation
 */
export interface BinarySearchValidationResult {
  valid: boolean;
  /** Rejection reason if hard gate failed */
  reason?: RejectionReason | 'SUFFIX_CHARSET_INVALID';
  description?: string;
  mismatchIndex?: number;
  expectedByte?: number;
  actualByte?: number;
  /** Soft penalty for suffix charset violations (0 = no penalty, higher = worse) */
  suffixCharsetPenalty?: number;
  /** Whether this was a hard gate failure vs soft penalty */
  hardGateFailed?: boolean;
}

/**
 * Validate that decoded data preserves the original data exactly (byte-level comparison).
 * This is the HARD GATE acceptance criteria for HYBRID QR-Art.
 *
 * HARD GATE REQUIREMENTS (must pass):
 * 1. Decoded data must exist
 * 2. Decoded data length >= original data length
 * 3. First N bytes must match exactly (N = original data length)
 *
 * SOFT PENALTY (does not cause rejection):
 * 4. Suffix charset violations are counted as soft penalty, NOT hard rejection
 *    This allows the optimizer to accept candidates with non-URL-safe suffix bytes.
 *    The suffix is intentionally mutable in HYBRID mode!
 *
 * @param decoded The decoded string from scanning
 * @param originalData The original data that must be preserved
 * @param strictSuffix If true, suffix charset violations cause hard rejection (default: false)
 * @returns Validation result with details
 */
export function validateByteExactPrefix(
  decoded: string | undefined,
  originalData: string,
  strictSuffix: boolean = false
): BinarySearchValidationResult {
  if (decoded === undefined || decoded === null) {
    return {
      valid: false,
      reason: 'SCAN_FAILED',
      description: 'decoded data is null/undefined',
      hardGateFailed: true,
    };
  }

  if (decoded.length < originalData.length) {
    return {
      valid: false,
      reason: 'LENGTH_TOO_SHORT',
      description: `decoded length (${decoded.length}) < original length (${originalData.length})`,
      hardGateFailed: true,
    };
  }

  // Byte-exact comparison for the protected prefix - THIS IS THE HARD GATE
  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.codePointAt(i)!;
    const actualByte = decoded.codePointAt(i)!;

    if (expectedByte !== actualByte) {
      return {
        valid: false,
        reason: 'BYTE_MISMATCH',
        description: `byte mismatch at index ${i}: expected 0x${expectedByte.toString(16)}, got 0x${actualByte.toString(16)}`,
        mismatchIndex: i,
        expectedByte,
        actualByte,
        hardGateFailed: true,
      };
    }
  }

  // Calculate suffix charset penalty (SOFT PENALTY, not hard rejection by default)
  return evaluateSuffixCharset(decoded, originalData, strictSuffix);
}

export const URL_SAFE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~#';

export function countInvalidSuffixChars(suffix: string): number {
  let invalidCount = 0;
  for (let i = 0; i < suffix.length; i++) {
    const charCode = suffix.codePointAt(i)!;
    if (charCode < 32 || charCode > 126 || !URL_SAFE_CHARS.includes(suffix[i])) {
      invalidCount++;
    }
  }
  return invalidCount;
}

export function evaluateSuffixCharset(
  decoded: string,
  originalData: string,
  strictSuffix: boolean
): BinarySearchValidationResult {
  let suffixCharsetPenalty = 0;
  if (decoded.length > originalData.length) {
    const suffix = decoded.slice(originalData.length);
    const charsetValidation = validateSuffixCharset(suffix);

    if (!charsetValidation.valid) {
      suffixCharsetPenalty = countInvalidSuffixChars(suffix) / suffix.length;

      if (strictSuffix) {
        return {
          valid: false,
          reason: 'SUFFIX_CHARSET_INVALID',
          description: `Suffix contains invalid character at index ${charsetValidation.invalidCharIndex}: ${charsetValidation.invalidChar} (0x${charsetValidation.invalidCharCode?.toString(16)})`,
          mismatchIndex: originalData.length + (charsetValidation.invalidCharIndex ?? 0),
          actualByte: charsetValidation.invalidCharCode,
          suffixCharsetPenalty,
          hardGateFailed: true,
        };
      }
    }
  }

  return {
    valid: true,
    suffixCharsetPenalty,
    hardGateFailed: false,
  };
}

export interface CandidateValidation {
  isValid: boolean;
  validation: BinarySearchValidationResult;
  formatVerification?: FormatVerificationResult;
}

export function validateCandidate(
  scan: { success: boolean; data?: string },
  matrix: boolean[][],
  expectedData: string,
  expectedEcc: ECCLevel | undefined,
  expectedMask: number | undefined,
  strictSuffix: boolean
): CandidateValidation {
  if (!scan.success) {
    return {
      isValid: false,
      validation: {
        valid: false,
        reason: 'SCAN_FAILED',
        description: 'not scanned',
        hardGateFailed: true,
      },
    };
  }

  const validation = validateByteExactPrefix(scan.data, expectedData, strictSuffix);
  if (!validation.valid) {
    return { isValid: false, validation };
  }

  if (expectedEcc !== undefined && expectedMask !== undefined) {
    const formatVerification = verifyMatrixFormatInfo(matrix, expectedEcc, expectedMask);
    if (!formatVerification.valid) {
      return {
        isValid: false,
        validation: {
          valid: false,
          reason: formatVerification.reason || 'ECC_MISMATCH',
          description: `Format info mismatch: ECC ${formatVerification.extractedEcc} vs ${expectedEcc}, mask ${formatVerification.extractedMask} vs ${expectedMask}`,
          hardGateFailed: true,
        },
        formatVerification,
      };
    }
    return { isValid: true, validation, formatVerification };
  }

  return { isValid: true, validation };
}

/**
 * Use binary search to find the maximum number of vectors that produces
 * a scannable QR code that preserves the original data.
 *
 * HYBRID STRATEGY: The decoded data must START WITH expectedData (prefix match).
 * The suffix portion CAN be modified - that's the whole point of QR-Art!
 * Only the original URL/content (protected region) must be preserved.
 *
 * SEMANTIC-HARD-GATE: Also verifies format info (ECC and mask) match expected values.
 *
 * @param flattened Flattened and importance-sorted selections
 * @param originalBlockData Original block data arrays
 * @param originalBlockEcc Original block ECC arrays
 * @param blockDataCounts Data counts per block
 * @param blockEccCounts ECC counts per block
 * @param eliminationResult Full elimination result
 * @param regenerateQRFn Function to regenerate QR matrix
 * @param scanQRFn Function to scan QR matrix and check validity
 * @param expectedData The original data that must be preserved (HYBRID: prefix match)
 * @param expectedEcc Expected ECC level (for format info verification)
 * @param expectedMask Expected mask pattern (for format info verification)
 * @param strictSuffix If true, reject candidates with non-URL-safe suffix bytes (default: false)
 * @returns Binary search result with optimal matrix
 */
export interface BaseMatrixResult {
  valid: boolean;
  result: ReturnType<typeof applySubsetAndRegenerate>;
  formatVerification?: FormatVerificationResult;
}

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
    blockEccCounts: number[]
  ) => boolean[][],
  scanQRFn: (matrix: boolean[][]) => { success: boolean; data?: string },
  expectedData: string,
  expectedEcc: ECCLevel | undefined,
  expectedMask: number | undefined,
  strictSuffix: boolean,
  rejectionHistogram: RejectionHistogram
): BaseMatrixResult {
  const baseResult = applySubsetAndRegenerate(
    flattened,
    0,
    originalBlockData,
    originalBlockEcc,
    blockDataCounts,
    blockEccCounts,
    eliminationResult,
    regenerateQRFn
  );
  const baseScan = scanQRFn(baseResult.matrix);
  if (!baseScan.success) {
    log.warn('Base matrix (0 vectors) does not scan - this is a fundamental bug');
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
      log.warn('Base matrix (0 vectors) FORMAT VERIFICATION FAILED!', {
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

  log.debug('Base matrix (0 vectors) validation PASSED', {
    decodedData: baseScan.data,
    decodedLength: baseScan.data?.length,
    validationMethod: 'SEMANTIC_HARD_GATE',
    formatVerified: baseFormatVerification?.valid,
    extractedEcc: baseFormatVerification?.extractedEcc,
    extractedMask: baseFormatVerification?.extractedMask,
    suffixCharsetPenalty: baseValidation.suffixCharsetPenalty,
  });

  return { valid: true, result: baseResult, formatVerification: baseFormatVerification };
}

export function logBaseValidationFailure(
  decodedData: string | undefined,
  expectedData: string,
  baseValidation: BinarySearchValidationResult
): void {
  const decoded = decodedData || '';
  const expectedHexDump = Array.from(expectedData.slice(0, 32))
    .map((c) => c.codePointAt(0)!.toString(16).padStart(2, '0'))
    .join(' ');
  const decodedHexDump = Array.from(decoded.slice(0, 32))
    .map((c) => c.codePointAt(0)!.toString(16).padStart(2, '0'))
    .join(' ');

  log.warn('Base matrix (0 vectors) validation FAILED - encoding bug!', {
    rejectionReason: baseValidation.reason,
    description: baseValidation.description,
    expectedData,
    expectedDataLength: expectedData.length,
    decodedData,
    decodedLength: decodedData?.length,
    mismatchIndex: baseValidation.mismatchIndex,
    expectedByte: baseValidation.expectedByte?.toString(16),
    actualByte: baseValidation.actualByte?.toString(16),
  });

  log.warn('BYTE-LEVEL COMPARISON (first 32 bytes)', {
    expectedHex: expectedHexDump,
    decodedHex: decodedHexDump,
    mismatchIndex: baseValidation.mismatchIndex,
  });
}

export function trackRejection(
  rejectionHistogram: RejectionHistogram,
  isValid: boolean,
  validation: BinarySearchValidationResult
): void {
  rejectionHistogram.total++;
  if (isValid) {
    rejectionHistogram.ACCEPTED++;
    return;
  }
  if (validation.reason) {
    const reason = validation.reason as keyof RejectionHistogram;
    if (reason in rejectionHistogram && reason !== 'ACCEPTED' && reason !== 'total') {
      rejectionHistogram[reason]++;
    }
  }
}

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
