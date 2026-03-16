import { type RSBlockInfo } from "./bit-mapping";
import { calculateProtectedBitsPerBlock } from "./calculate-protected-bits-per-block";

/**
 * @deprecated Use calculateProtectedBitsPerBlock instead
 * This is kept for backwards compatibility
 */
export function calculateHeaderBitsPerBlock(
  rsBlockInfo: RSBlockInfo[],
  headerBitCount: number,
): number[] {
  return calculateProtectedBitsPerBlock(rsBlockInfo, headerBitCount);
}
