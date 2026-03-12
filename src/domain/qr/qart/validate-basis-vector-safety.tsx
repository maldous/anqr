import type { BasisVectorViolation } from './basis-vector-violation';

export function validateBasisVectorSafety(
  vectors: Array<{
    rsBlockIndex: number;
    posInBlock: number;
    bitInByte: number;
    dataBitIndex: number;
  }>,
  blockDataCounts: number[],
  protectedBitEnd: number,
  gapStartBit: number,
  gapEndBit: number
): BasisVectorViolation[] {
  const violations: BasisVectorViolation[] = [];

  for (let i = 0; i < vectors.length; i++) {
    const vector = vectors[i];
    let linearByteOffset = 0;
    for (let b = 0; b < vector.rsBlockIndex; b++) {
      linearByteOffset += blockDataCounts[b];
    }
    const linearByte = linearByteOffset + vector.posInBlock;
    const linearBit = linearByte * 8 + (7 - vector.bitInByte);

    if (linearBit < protectedBitEnd) {
      violations.push({
        vectorIndex: i,
        dataBitIndex: vector.dataBitIndex,
        blockIndex: vector.rsBlockIndex,
        localBitIndex: vector.posInBlock * 8 + (7 - vector.bitInByte),
        linearBit,
        violationType: 'ORIGINAL_DATA',
      });
    } else if (linearBit >= gapStartBit && linearBit < gapEndBit) {
      violations.push({
        vectorIndex: i,
        dataBitIndex: vector.dataBitIndex,
        blockIndex: vector.rsBlockIndex,
        localBitIndex: vector.posInBlock * 8 + (7 - vector.bitInByte),
        linearBit,
        violationType: 'TERMINATOR_GAP',
      });
    }
  }

  return violations;
}
