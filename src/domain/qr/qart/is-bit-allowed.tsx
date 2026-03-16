/**
 * Check if a given bit index (in block-local coordinates) is within allowed ranges
 *
 * @param blockAllowedBits Per-block allowed bit sets
 * @param blockIndex RS block index
 * @param localBitIndex Bit index within the block (0-indexed)
 * @returns True if this bit can be modified
 */
export function isBitAllowed(
  blockAllowedBits: Map<number, Set<number>>,
  blockIndex: number,
  localBitIndex: number,
): boolean {
  const allowedSet = blockAllowedBits.get(blockIndex);
  if (!allowedSet) return false;
  return allowedSet.has(localBitIndex);
}
