import { lookupShiftJIS } from './lookup-shift-jis';

/**
 * Convert a single Unicode character to Shift-JIS bytes
 * @param codePoint Unicode code point
 * @returns Array of bytes (1 or 2 bytes)
 */
export function unicodeToShiftJIS(codePoint: number): number[] {
  return lookupShiftJIS(codePoint) ?? [0x3f];
}
