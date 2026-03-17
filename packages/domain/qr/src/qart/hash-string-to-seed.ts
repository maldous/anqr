/**
 * Simple hash function to create a deterministic seed from a string.
 * Uses djb2 algorithm.
 *
 * @param str Input string to hash
 * @returns 32-bit hash value
 */
export function hashStringToSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.codePointAt(i)!;
  }
  return hash >>> 0; // Convert to unsigned 32-bit
}
