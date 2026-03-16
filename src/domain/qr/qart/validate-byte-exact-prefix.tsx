import { evaluateSuffixCharset } from "./evaluate-suffix-charset";
import type { BinarySearchValidationResult } from "./binary-search-validation-result";

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
  strictSuffix: boolean = false,
): BinarySearchValidationResult {
  if (decoded === undefined || decoded === null) {
    return {
      valid: false,
      reason: "SCAN_FAILED",
      description: "decoded data is null/undefined",
      hardGateFailed: true,
    };
  }

  if (decoded.length < originalData.length) {
    return {
      valid: false,
      reason: "LENGTH_TOO_SHORT",
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
        reason: "BYTE_MISMATCH",
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
