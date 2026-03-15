/**
 * Integer utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Integer {
  static readonly MIN_VALUE_32_BITS = -2147483648;
  static readonly MAX_VALUE = Number.MAX_SAFE_INTEGER;

  /**
   * Count trailing zeros
   */
  static numberOfTrailingZeros(i: number): number {
    if (i === 0) return 32;
    let n = 31;
    let y = i << 16;
    if (y !== 0) {
      n -= 16;
      i = y;
    }
    y = i << 8;
    if (y !== 0) {
      n -= 8;
      i = y;
    }
    y = i << 4;
    if (y !== 0) {
      n -= 4;
      i = y;
    }
    y = i << 2;
    if (y !== 0) {
      n -= 2;
      i = y;
    }
    return n - ((i << 1) >>> 31);
  }

  /**
   * Count leading zeros
   */
  static numberOfLeadingZeros(i: number): number {
    if (i === 0) return 32;
    let n = 1;
    if (i >>> 16 === 0) {
      n += 16;
      i <<= 16;
    }
    if (i >>> 24 === 0) {
      n += 8;
      i <<= 8;
    }
    if (i >>> 28 === 0) {
      n += 4;
      i <<= 4;
    }
    if (i >>> 30 === 0) {
      n += 2;
      i <<= 2;
    }
    n -= i >>> 31;
    return n;
  }

  /**
   * Convert to hex string
   */
  static toHexString(i: number): string {
    return i.toString(16);
  }

  /**
   * Count set bits (population count)
   */
  static bitCount(i: number): number {
    i = i - ((i >>> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
    i = (i + (i >>> 4)) & 0x0f0f0f0f;
    i = i + (i >>> 8);
    i = i + (i >>> 16);
    return i & 0x3f;
  }

  /**
   * Truncated integer division
   */
  static truncDivision(dividend: number, divisor: number): number {
    return Math.trunc(dividend / divisor);
  }

  /**
   * Parse integer
   */
  static parseInt(num: string, radix?: number): number {
    return Number.parseInt(num, radix);
  }
}
