/**
 * Calculate ECC damage estimate for a block.
 * Returns the number of data codewords changed and safe limit.
 */
export function calculateECCDamage(
  originalData: Uint8Array,
  modifiedData: Uint8Array,
  eccCount: number,
): { changedCodewords: number; safeLimit: number; isOverBudget: boolean } {
  let changedCodewords = 0;
  for (let i = 0; i < originalData.length; i++) {
    if (originalData[i] !== modifiedData[i]) {
      changedCodewords++;
    }
  }
  // RS can correct up to floor(eccCount/2) errors
  // We use eccCount/2 - 2 as safe limit for margin
  const safeLimit = Math.floor(eccCount / 2) - 2;
  return {
    changedCodewords,
    safeLimit: Math.max(0, safeLimit),
    isOverBudget: changedCodewords > safeLimit,
  };
}
