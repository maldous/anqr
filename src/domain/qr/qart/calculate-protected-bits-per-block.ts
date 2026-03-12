import { type RSBlockInfo } from './bit-mapping';
import { simulateInterleavingProtection, log } from './rs-basis._internal';

/**
 * Calculate how many protected bits belong to each RS block.
 *
 * CRITICAL: QR data is INTERLEAVED before placement into the matrix!
 * The interleaving pattern takes one byte from each block in turn:
 *   Interleaved[0] = Block0[0]
 *   Interleaved[1] = Block1[0]
 *   Interleaved[2] = Block2[0]
 *   ...
 *   Interleaved[N] = Block0[1]
 *   etc.
 *
 * When we protect "the first N bits" of content, those N bits are at the START
 * of the INTERLEAVED stream. This means bytes from ALL blocks may be part of
 * the protected region!
 *
 * For example, to protect the first 19 interleaved bytes with 4 blocks:
 *   - Block0[0..4], Block1[0..4], Block2[0..4], Block3[0..3] are all protected
 *
 * This function correctly handles interleaving by simulating the pattern
 * and tracking which bytes in each block fall within the protected region.
 *
 * @param rsBlockInfo Array of RS block info
 * @param protectedBitCount Total number of bits to protect (in interleaved stream)
 * @returns Array of protected bits per block (index = block index)
 */
export function calculateProtectedBitsPerBlock(
  rsBlockInfo: RSBlockInfo[],
  protectedBitCount: number
): number[] {
  const numBlocks = rsBlockInfo.length;
  const protectedBitsPerBlock = new Array(numBlocks).fill(0);

  if (protectedBitCount === 0 || numBlocks === 0) {
    return protectedBitsPerBlock;
  }

  const protectedByteCount = Math.ceil(protectedBitCount / 8);
  const maxProtectedByteInBlock = simulateInterleavingProtection(
    rsBlockInfo,
    numBlocks,
    protectedByteCount
  );

  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    if (maxProtectedByteInBlock[blockIdx] >= 0) {
      protectedBitsPerBlock[blockIdx] = (maxProtectedByteInBlock[blockIdx] + 1) * 8;
    }
  }

  log.debug('Calculated interleave-aware protected bits per block', {
    protectedBitCount,
    protectedByteCount,
    maxProtectedByteInBlock,
    protectedBitsPerBlock,
    blockDataCounts: rsBlockInfo.map((b) => b.dataCount),
  });

  return protectedBitsPerBlock;
}
