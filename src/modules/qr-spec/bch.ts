/**
 * BCH (Bose-Chaudhuri-Hocquenghem) Encoding
 * Used for format information and version information in QR codes
 */

// BCH(15,5) generator polynomial for format info: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);

// BCH(18,6) generator polynomial for version info: x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);

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

/**
 * Calculate BCH code for format information
 * Format info = (ECC level << 3) | mask pattern
 * @param data 5-bit format data
 * @returns 15-bit BCH encoded format info (XORed with mask)
 */
export function getBCHTypeInfo(data: number): number {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
  }
  return ((data << 10) | d) ^ G15_MASK;
}

/**
 * Calculate BCH code for version information
 * @param data 6-bit version number
 * @returns 18-bit BCH encoded version info
 */
export function getBCHTypeNumber(data: number): number {
  let d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
  }
  return (data << 12) | d;
}
