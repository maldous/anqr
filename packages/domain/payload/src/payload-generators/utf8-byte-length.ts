/**
 * Calculate UTF-8 byte length of a string
 */
export function utf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}
