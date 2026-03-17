import { accumulateByteGroupMasks } from "./accumulate-byte-group-masks";

export function accumulateDenseVectorMasks(
  blockBits: Uint8Array,
  dataCount: number,
  blockStart: number,
  numericDataStart: number,
  numericDataBits: number,
  groupIndexForBit: Int32Array,
  bitMaskForBit: Int32Array,
  groupMasks: Int32Array,
  touched: Int32Array,
): number {
  let touchedCount = 0;
  for (let byteIdx = 0; byteIdx < dataCount; byteIdx++) {
    const byte = blockBits[byteIdx];
    if (!byte) continue;
    touchedCount = accumulateByteGroupMasks(
      byte,
      blockStart + byteIdx,
      numericDataStart,
      numericDataBits,
      groupIndexForBit,
      bitMaskForBit,
      groupMasks,
      touched,
      touchedCount,
    );
  }
  return touchedCount;
}
