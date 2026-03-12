import { accumulateByteGroupMasks } from './accumulate-byte-group-masks';

export function accumulateSparseVectorMasks(
  nzIdx: Uint16Array,
  nzVals: Uint8Array,
  dataCount: number,
  blockStart: number,
  numericStartByte: number,
  numericEndByte: number,
  numericDataStart: number,
  numericDataBits: number,
  groupIndexForBit: Int32Array,
  bitMaskForBit: Int32Array,
  groupMasks: Int32Array,
  touched: Int32Array
): number {
  let touchedCount = 0;
  const firstByte = nzIdx[0] ?? -1;
  const lastByte = nzIdx[nzIdx.length - 1] ?? -1;
  if (firstByte < numericEndByte && lastByte >= numericStartByte) {
    for (let k = 0; k < nzIdx.length; k++) {
      const byteIdx = nzIdx[k];
      if (byteIdx >= dataCount) continue;
      touchedCount = accumulateByteGroupMasks(
        nzVals[k],
        blockStart + byteIdx,
        numericDataStart,
        numericDataBits,
        groupIndexForBit,
        bitMaskForBit,
        groupMasks,
        touched,
        touchedCount
      );
    }
  }
  return touchedCount;
}
