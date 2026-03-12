import { lookupShiftJIS } from './shift-jis._internal';

/**
 * Check if a string can be fully encoded in Shift-JIS without replacements
 * @param s String to check
 * @returns true if all characters have Shift-JIS mappings
 */
export function canEncodeAsShiftJIS(s: string): boolean {
  let i = 0;
  while (i < s.length) {
    const codePoint = s.codePointAt(i);
    if (codePoint === undefined) {
      i++;
      continue;
    }
    if (codePoint > 0xffff) {
      return false;
    }
    if (lookupShiftJIS(codePoint) === null) return false;
    i++;
  }
  return true;
}
