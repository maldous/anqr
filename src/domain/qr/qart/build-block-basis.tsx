import { type RSBlockInfo } from './bit-mapping';
import type { RSBasisVector } from './rs-basis.types';
import { createSingleBitBasisVector } from './create-single-bit-basis-vector';
import { log } from './log-2';

/**
 * Build basis vectors for a single RS block
 * Each vector has exactly one data bit set to 1, with corresponding ECC
 *
 * @param blockInfo The RS block info
 * @param rsBlockIndex Index of this block
 * @param globalBitOffset Starting global bit index for this block's data
 * @param allowedLocalBits Set of local bit indices that are allowed to be modified (if undefined, all bits allowed)
 * @returns Array of basis vectors for this block
 */
export function buildBlockBasis(
  blockInfo: RSBlockInfo,
  rsBlockIndex: number,
  globalBitOffset: number,
  allowedLocalBits?: Set<number>
): RSBasisVector[] {
  const { dataCount } = blockInfo;
  const vectors: RSBasisVector[] = [];

  let skippedCount = 0;
  let createdCount = 0;
  let firstCreatedLocalBit = -1;
  let lastCreatedLocalBit = -1;

  for (let byteIdx = 0; byteIdx < dataCount; byteIdx++) {
    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      const localBitIndex = byteIdx * 8 + (7 - bitIdx);

      if (allowedLocalBits !== undefined && !allowedLocalBits.has(localBitIndex)) {
        skippedCount++;
        continue;
      }

      if (firstCreatedLocalBit < 0) firstCreatedLocalBit = localBitIndex;
      lastCreatedLocalBit = localBitIndex;
      createdCount++;

      vectors.push(
        createSingleBitBasisVector(blockInfo, rsBlockIndex, globalBitOffset, byteIdx, bitIdx)
      );
    }
  }

  if (allowedLocalBits !== undefined) {
    log.debug('Block basis created with protection', {
      blockIndex: rsBlockIndex,
      dataBytes: dataCount,
      totalBlockBits: dataCount * 8,
      allowedBitsProvided: allowedLocalBits.size,
      vectorsCreated: createdCount,
      vectorsSkipped: skippedCount,
      createdLocalBitRange:
        createdCount > 0 ? `${firstCreatedLocalBit} - ${lastCreatedLocalBit}` : 'none',
      createdByteRange:
        createdCount > 0
          ? `${Math.floor(firstCreatedLocalBit / 8)} - ${Math.floor(lastCreatedLocalBit / 8)}`
          : 'none',
    });
  }

  return vectors;
}
