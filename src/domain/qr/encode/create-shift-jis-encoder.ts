import { unicodeToShiftJIS } from './unicode-to-shift-jis';

/**
 * Create a Shift-JIS encoder function for use with qrcode.stringToBytes
 * @returns Function that converts a Unicode string to Shift-JIS byte array
 */
export function createShiftJISEncoder(): (s: string) => number[] {
  return (s: string): number[] => {
    const bytes: number[] = [];

    let i = 0;
    while (i < s.length) {
      const codePoint = s.codePointAt(i);
      if (codePoint === undefined) {
        i++;
        continue;
      }

      // Handle surrogate pairs for characters outside BMP
      if (codePoint > 0xffff) {
        i += 2; // Skip the surrogate pair
        // Most Shift-JIS characters are in BMP, use replacement for others
        bytes.push(0x3f);
        continue;
      }

      const sjisBytes = unicodeToShiftJIS(codePoint);
      bytes.push(...sjisBytes);
      i++;
    }

    return bytes;
  };
}
