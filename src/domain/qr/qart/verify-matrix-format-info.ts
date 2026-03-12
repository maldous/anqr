import type { ECCLevel } from './bit-mapping';
import type { FormatVerificationResult, RejectionReason } from './validation.types';
import { extractMaskFromMatrix } from './extract-mask-from-matrix';
import { eccNumericToLevel } from './ecc-numeric-to-level';

/**
 * Verify that a matrix's format info matches expected ECC and mask.
 *
 * This is a critical sanity check that should be performed after:
 * 1. Base matrix generation
 * 2. Final matrix regeneration
 * 3. Binary search fallback attempts
 *
 * If format info doesn't match, the QR will decode but with wrong
 * error correction level, which affects scannability.
 *
 * Exported for use in binary search fallback validation.
 *
 * @param matrix The QR matrix to verify
 * @param expectedEcc Expected ECC level
 * @param expectedMask Expected mask pattern
 * @returns Verification result with extracted values
 */
export function verifyMatrixFormatInfo(
  matrix: boolean[][],
  expectedEcc: ECCLevel,
  expectedMask: number
): FormatVerificationResult {
  const extracted = extractMaskFromMatrix(matrix);
  const extractedEcc = eccNumericToLevel(extracted.eccLevel);
  const eccMatch = extractedEcc === expectedEcc;
  const maskMatch = extracted.mask === expectedMask;

  let reason: RejectionReason | undefined;
  if (!eccMatch) {
    reason = 'ECC_MISMATCH';
  } else if (!maskMatch) {
    reason = 'MASK_MISMATCH';
  }

  return {
    valid: eccMatch && maskMatch,
    extractedEcc,
    extractedMask: extracted.mask,
    eccMatch,
    maskMatch,
    reason,
  };
}
