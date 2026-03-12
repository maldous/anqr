export function applyVectorDenseXOR(
  blockBits: Uint8Array,
  blockData: Uint8Array,
  blockEcc: Uint8Array,
  dataCount: number
): void {
  for (let i = 0; i < dataCount; i++) {
    blockData[i] ^= blockBits[i];
  }
  const eccCount = blockEcc.length;
  for (let i = 0; i < eccCount; i++) {
    blockEcc[i] ^= blockBits[dataCount + i];
  }
}
