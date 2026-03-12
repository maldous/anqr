// BCH(15,5) generator polynomial for format info: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1;

// BCH(18,6) generator polynomial for version info: x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1;

// XOR mask for format info (to ensure no all-zero pattern)
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

/**
 * Get the number of bits needed to represent a number
 */
function getBCHDigit(data: number): number {
  let digit = 0;
  let d = data;
  while (d !== 0) {
    digit += 1;
    d >>>= 1;
  }
  return digit;
}

export { G15, G18, G15_MASK, getBCHDigit };
