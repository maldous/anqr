export function countDataDiffs(
  origData: Uint8Array,
  modData: Uint8Array,
): { bytesChanged: number; bitsChanged: number } {
  let bytesChanged = 0;
  let bitsChanged = 0;
  for (let i = 0; i < origData.length; i++) {
    if (origData[i] !== modData[i]) {
      bytesChanged++;
      let diff = origData[i] ^ modData[i];
      while (diff) {
        bitsChanged += diff & 1;
        diff >>>= 1;
      }
    }
  }
  return { bytesChanged, bitsChanged };
}
