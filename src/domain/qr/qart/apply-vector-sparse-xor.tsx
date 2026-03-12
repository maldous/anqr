/**
 * Apply selected basis vectors to modify BOTH data AND ECC bytes for a single block
 * XORs the selected vectors' complete blockBits (data + ECC) with the base codeword.
 *
 * IMPORTANT: RS codes are linear - XOR of valid codewords is valid. Since basis
 * vectors contain valid codewords (data + correct ECC), XORing preserves validity.
 * We MUST XOR both data AND ECC to maintain this property.
 *
 * @param blockData Original data bytes for this block (will be modified in place)
 * @param blockEcc Original ECC bytes for this block (will be modified in place)
 * @param blockVectors Eliminated basis vectors for this block
 * @param selectedIndices Indices of vectors within this block to apply
 * @param dataCount Number of data bytes in this block
 */
export function applyVectorSparseXOR(
  nzIdx: Uint16Array,
  nzVals: Uint8Array,
  blockData: Uint8Array,
  blockEcc: Uint8Array,
  dataCount: number
): void {
  for (let k = 0; k < nzIdx.length; k++) {
    const byteIdx = nzIdx[k];
    const byteVal = nzVals[k];
    if (byteIdx < dataCount) {
      blockData[byteIdx] ^= byteVal;
    } else {
      const eccIdx = byteIdx - dataCount;
      if (eccIdx >= 0 && eccIdx < blockEcc.length) {
        blockEcc[eccIdx] ^= byteVal;
      }
    }
  }
}
