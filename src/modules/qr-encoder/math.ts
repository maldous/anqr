/**
 * QR Math Module
 * Galois field arithmetic for Reed-Solomon error correction
 */

import type { QRPolynomial } from './types';

// Galois field exponent table
const EXP_TABLE = new Array<number>(256);
// Galois field log table
const LOG_TABLE = new Array<number>(256);

// Initialize Galois field tables
// Using polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
for (let i = 0; i < 8; i += 1) {
  EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i += 1) {
  EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i += 1) {
  LOG_TABLE[EXP_TABLE[i]] = i;
}

/**
 * Galois field logarithm
 */
export function glog(n: number): number {
  if (n < 1) {
    throw new Error(`glog(${n})`);
  }
  return LOG_TABLE[n];
}

/**
 * Galois field exponentiation
 */
export function gexp(n: number): number {
  let exp = n;
  while (exp < 0) {
    exp += 255;
  }
  while (exp >= 256) {
    exp -= 255;
  }
  return EXP_TABLE[exp];
}

/**
 * Create a polynomial for Reed-Solomon encoding
 */
export function qrPolynomial(num: number[], shift: number): QRPolynomial {
  if (typeof num.length === 'undefined') {
    throw new Error(`${num.length}/${shift}`);
  }

  // Remove leading zeros
  const _num = ((): number[] => {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset += 1;
    }
    const result = new Array<number>(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i += 1) {
      result[i] = num[i + offset];
    }
    return result;
  })();

  const _this: QRPolynomial = {
    getAt: (index: number) => _num[index],
    getLength: () => _num.length,

    multiply: (e: QRPolynomial): QRPolynomial => {
      const result = new Array<number>(_this.getLength() + e.getLength() - 1);
      for (let i = 0; i < result.length; i++) {
        result[i] = 0;
      }

      for (let i = 0; i < _this.getLength(); i += 1) {
        for (let j = 0; j < e.getLength(); j += 1) {
          result[i + j] ^= gexp(glog(_this.getAt(i)) + glog(e.getAt(j)));
        }
      }

      return qrPolynomial(result, 0);
    },

    mod: (e: QRPolynomial): QRPolynomial => {
      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      const ratio = glog(_this.getAt(0)) - glog(e.getAt(0));

      const result = new Array<number>(_this.getLength());
      for (let i = 0; i < _this.getLength(); i += 1) {
        result[i] = _this.getAt(i);
      }

      for (let i = 0; i < e.getLength(); i += 1) {
        result[i] ^= gexp(glog(e.getAt(i)) + ratio);
      }

      // Recursive call
      return qrPolynomial(result, 0).mod(e);
    },
  };

  return _this;
}

export const QRMath = {
  glog,
  gexp,
};
