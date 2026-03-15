/**
 * Convert a string to a Uint8Array of its bytes
 */
export function stringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.codePointAt(i)! & 0xff;
  }
  return bytes;
}
