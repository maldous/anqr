/**
 * Validate that decoded data preserves the original data exactly (byte-level comparison).
 * This is the STRICT acceptance criteria for HYBRID QR-Art.
 *
 * Requirements:
 * 1. Decoded data must exist
 * 2. Decoded data length >= original data length
 * 3. First N bytes must match exactly (N = original data length)
 *
 * @param decoded The decoded string from scanning
 * @param originalData The original data that must be preserved
 * @returns Validation result with details
 */
export function validateOriginalDataPreserved(
  decoded: string | undefined,
  originalData: string
): {
  valid: boolean;
  reason?: string;
  mismatch?: {
    index: number;
    expectedByte: number;
    actualByte: number;
    expectedChar: string;
    actualChar: string;
  };
} {
  if (decoded === undefined || decoded === null) {
    return { valid: false, reason: 'decoded data is null/undefined' };
  }

  if (decoded.length < originalData.length) {
    return {
      valid: false,
      reason: `decoded length (${decoded.length}) < original length (${originalData.length})`,
    };
  }

  // Byte-exact comparison for the protected prefix
  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.codePointAt(i)!;
    const actualByte = decoded.codePointAt(i)!;

    if (expectedByte !== actualByte) {
      return {
        valid: false,
        reason: `byte mismatch at index ${i}`,
        mismatch: {
          index: i,
          expectedByte,
          actualByte,
          expectedChar: String.fromCodePoint(expectedByte),
          actualChar: String.fromCodePoint(actualByte),
        },
      };
    }
  }

  return { valid: true };
}
