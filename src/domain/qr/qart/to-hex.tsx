/**
 * Convert bytes to hex string for debugging
 */
export function toHex(bytes: Uint8Array, maxBytes: number = 32): string {
  const slice = bytes.slice(0, maxBytes);
  const hex = Array.from(slice)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
  return bytes.length > maxBytes ? `${hex}...` : hex;
}
