export function computeLinearBitPosition(
  blockIndex: number,
  posInBlock: number,
  bitInByte: number,
  blockDataCounts: number[]
): { linearByte: number; linearBit: number } {
  let linearByteOffset = 0;
  for (let b = 0; b < blockIndex; b++) {
    linearByteOffset += blockDataCounts[b];
  }
  const linearByte = linearByteOffset + posInBlock;
  const linearBit = linearByte * 8 + (7 - bitInByte);
  return { linearByte, linearBit };
}
