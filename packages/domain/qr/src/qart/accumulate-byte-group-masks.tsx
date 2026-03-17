export function accumulateByteGroupMasks(
  byteValue: number,
  linearByteOffset: number,
  numericDataStart: number,
  numericDataBits: number,
  groupIndexForBit: Int32Array,
  bitMaskForBit: Int32Array,
  groupMasks: Int32Array,
  touched: Int32Array,
  touchedCount: number,
): number {
  for (let bitInByte = 7; bitInByte >= 0; bitInByte--) {
    if ((byteValue & (1 << bitInByte)) === 0) continue;
    const linearBit = linearByteOffset * 8 + (7 - bitInByte);
    if (linearBit < numericDataStart || linearBit >= numericDataStart + numericDataBits) continue;
    const local = linearBit - numericDataStart;
    const g = groupIndexForBit[local];
    if (g < 0) continue;
    if (groupMasks[g] === 0) {
      touched[touchedCount++] = g;
    }
    groupMasks[g] ^= bitMaskForBit[local];
  }
  return touchedCount;
}
