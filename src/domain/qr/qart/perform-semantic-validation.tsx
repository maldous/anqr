import type { ECCLevel } from './bit-mapping';
import {
  eccNumericToLevel,
  extractMaskFromMatrix,
  type SemanticValidationResult,
} from './validation';
import { semanticFailure } from './semantic-failure';
import { validateDecodedPrefix } from './validate-decoded-prefix';
import { validateSuffixForSemanticGate } from './validate-suffix-for-semantic-gate';
import type { ScanResult } from './scan-result';

/**
 * SEMANTIC-HARD-GATE VALIDATION
 *
 * This is the acceptance criteria for QR-Art candidates.
 * A candidate is ONLY accepted if ALL of the following HARD GATE checks pass:
 *
 * 1. Decoder successfully scanned the matrix
 * 2. Decoded data length >= original data length
 * 3. First N bytes match exactly (N = original data length)
 * 4. Format info ECC matches requested ECC
 * 5. Format info mask matches requested mask
 * 6. Structural validity (no fake segments)
 *
 * SOFT PENALTY (does NOT cause rejection unless strictSuffix=true):
 * - Suffix charset violations (non-URL-safe bytes in suffix)
 *
 * The HYBRID mode intentionally allows the suffix to be mutated.
 * Rejecting candidates for suffix charset violations defeats the purpose
 * of QArt - we WANT to allow arbitrary byte values in the suffix for
 * maximum pixel control.
 *
 * This function performs comprehensive validation and returns
 * detailed rejection reasons for debugging.
 *
 * @param matrix The QR matrix to validate
 * @param originalData The original data that must be preserved
 * @param expectedEcc The requested ECC level
 * @param expectedMask The requested mask pattern
 * @param expectedSuffix Optional: the expected suffix (for HYBRID mode)
 * @param scanFn Function to scan the matrix
 * @param strictSuffix If true, reject candidates with non-URL-safe suffix bytes (default: false)
 * @returns Comprehensive validation result
 */
export function performSemanticValidation(
  matrix: boolean[][],
  originalData: string,
  expectedEcc: ECCLevel,
  expectedMask: number,
  expectedSuffix: string | undefined,
  scanFn: (matrix: boolean[][]) => ScanResult,
  strictSuffix: boolean = false,
  suffixMode: 'byte' | 'numeric' = 'byte'
): SemanticValidationResult {
  // Step 1: Scan the matrix
  const scanResult = scanFn(matrix);

  if (!scanResult.success) {
    return semanticFailure('SCAN_FAILED', `Scan failed: ${scanResult.error}`);
  }

  const decoded = scanResult.data;

  // Step 2: Check decoded data exists and has sufficient length
  if (decoded === undefined || decoded === null) {
    return semanticFailure('SCAN_FAILED', 'Decoded data is null/undefined');
  }

  const prefixValidationError = validateDecodedPrefix(decoded, originalData);
  if (prefixValidationError) {
    return prefixValidationError;
  }

  // Step 4: Verify format info (ECC and mask)
  const formatInfo = extractMaskFromMatrix(matrix);
  const actualEccLevel = eccNumericToLevel(formatInfo.eccLevel);

  if (actualEccLevel !== expectedEcc) {
    return semanticFailure(
      'ECC_MISMATCH',
      `Format ECC mismatch: expected ${expectedEcc}, got ${actualEccLevel}`,
      {
        expectedEcc,
        actualEcc: actualEccLevel,
      }
    );
  }

  if (formatInfo.mask !== expectedMask) {
    return semanticFailure(
      'MASK_MISMATCH',
      `Format mask mismatch: expected ${expectedMask}, got ${formatInfo.mask}`,
      {
        expectedMask,
        actualMask: formatInfo.mask,
      }
    );
  }

  // Step 5: Validate suffix charset (soft penalty unless strictSuffix=true).
  const suffixValidationError = validateSuffixForSemanticGate(
    decoded,
    originalData.length,
    expectedSuffix,
    strictSuffix,
    suffixMode
  );
  if (suffixValidationError) {
    return suffixValidationError;
  }

  // Step 6: Verify structural validity (no extra fake segments after primary data)
  // This catches the "byte segment ok, then fake Kanji" pattern that occurs when
  // terminator bits get flipped to fake mode indicators
  if (scanResult.structurallyValid === false) {
    // Get segment info for detailed error message
    const segmentModes = scanResult.segments?.map((s) => s.modeName) ?? [];
    const _invalidSegments = scanResult.segments?.filter((s) => !s.valid) ?? [];

    return semanticFailure(
      'EXTRA_SEGMENT',
      `Extra/fake segment(s) detected after primary data (modes: ${segmentModes.join(', ')})`,
      {
        segmentCount: scanResult.segmentCount,
      }
    );
  }

  // All checks passed!
  return {
    valid: true,
  };
}
