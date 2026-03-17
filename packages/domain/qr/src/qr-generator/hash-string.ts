/**
 * Simple string hash function (djb2)
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.codePointAt(i)!;
    hash = hash >>> 0; // Keep as unsigned 32-bit
  }
  return hash;
}
