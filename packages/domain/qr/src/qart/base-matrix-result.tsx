import type { FormatVerificationResult } from "./validation";
import { applySubsetAndRegenerate } from "./apply-subset-and-regenerate";

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
