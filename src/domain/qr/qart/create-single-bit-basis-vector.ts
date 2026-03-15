import type { RSBlockInfo } from './bit-mapping';
import type { RSBasisVector } from './rs-basis.types';
import { computeECC } from './compute-ecc';

/**
 * Create a single RS basis vector for one data bit.
 */
export function createSingleBitBasisVector(
  blockInfo: RSBlockInfo,
  rsBlockIndex: number,
  globalBitOffset: number,
  byteIdx: number,
  bitIdx: number
): RSBasisVector {
  const { dataCount, eccCount, totalCount } = blockInfo;
  const dataBitIndex = globalBitOffset + byteIdx * 8 + (7 - bitIdx);

  const dataBytes = new Uint8Array(dataCount);
  dataBytes[byteIdx] = 1 << bitIdx;

  const eccBytes = computeECC(dataBytes, eccCount);

  const blockBits = new Uint8Array(totalCount);
  blockBits.set(dataBytes, 0);
  blockBits.set(eccBytes, dataCount);

  return {
    dataBitIndex,
    rsBlockIndex,
    posInBlock: byteIdx,
    bitInByte: bitIdx,
    blockBits,
    affectedPixels: [],
    pivotPixel: -1,
  };
}
