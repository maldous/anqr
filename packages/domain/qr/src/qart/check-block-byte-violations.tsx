export function checkBlockByteViolations(
  blockIdx: number,
  originalData: Uint8Array,
  modifiedData: Uint8Array,
  allowedBitsInBlock: Set<number>,
  violations: Array<{
    blockIdx: number;
    byteIdx: number;
    original: number;
    modified: number;
    localBitStart: number;
  }>,
): void {
  for (let byteIdx = 0; byteIdx < originalData.length; byteIdx++) {
    const originalByte = originalData[byteIdx];
    const modifiedByte = modifiedData[byteIdx];

    if (originalByte === modifiedByte) continue;

    for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
      const localBitIndex = byteIdx * 8 + bitIdx;

      if (!allowedBitsInBlock.has(localBitIndex)) {
        const originalBit = (originalByte >> (7 - bitIdx)) & 1;
        const modifiedBit = (modifiedByte >> (7 - bitIdx)) & 1;

        if (originalBit !== modifiedBit) {
          violations.push({
            blockIdx,
            byteIdx,
            original: originalData[byteIdx],
            modified: modifiedData[byteIdx],
            localBitStart: byteIdx * 8,
          });
          break;
        }
      }
    }
  }
}
