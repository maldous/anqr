/**
 * QR Utility Functions
 * Pattern positions, BCH encoding, mask functions, and lost point calculation
 */

import { QRMode, QRMaskPattern } from './types';
import type { QRPolynomial, QRCodeInstance } from './types';
import { qrPolynomial, gexp } from './math';

// Alignment pattern position table by version
const PATTERN_POSITION_TABLE: number[][] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

// BCH constants
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

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
 */
export function getBCHTypeNumber(data: number): number {
  let d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
  }
  return (data << 12) | d;
}

/**
 * Get alignment pattern positions for a version
 */
export function getPatternPosition(typeNumber: number): number[] {
  return PATTERN_POSITION_TABLE[typeNumber - 1];
}

/**
 * Get mask function for a mask pattern
 */
export function getMaskFunction(maskPattern: number): (i: number, j: number) => boolean {
  switch (maskPattern) {
    case QRMaskPattern.PATTERN000:
      return (i, j) => (i + j) % 2 === 0;
    case QRMaskPattern.PATTERN001:
      return (i, _j) => i % 2 === 0;
    case QRMaskPattern.PATTERN010:
      return (_i, j) => j % 3 === 0;
    case QRMaskPattern.PATTERN011:
      return (i, j) => (i + j) % 3 === 0;
    case QRMaskPattern.PATTERN100:
      return (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case QRMaskPattern.PATTERN101:
      return (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0;
    case QRMaskPattern.PATTERN110:
      return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case QRMaskPattern.PATTERN111:
      return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default:
      throw new Error(`bad maskPattern:${maskPattern}`);
  }
}

/**
 * Get error correction polynomial
 */
export function getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
  let a = qrPolynomial([1], 0);
  for (let i = 0; i < errorCorrectLength; i += 1) {
    a = a.multiply(qrPolynomial([1, gexp(i)], 0));
  }
  return a;
}

/**
 * Get character count indicator length in bits
 */
export function getLengthInBits(mode: number, type: number): number {
  if (1 <= type && type < 10) {
    // Version 1-9
    switch (mode) {
      case QRMode.MODE_NUMBER: return 10;
      case QRMode.MODE_ALPHA_NUM: return 9;
      case QRMode.MODE_8BIT_BYTE: return 8;
      case QRMode.MODE_KANJI: return 8;
      default: throw new Error(`mode:${mode}`);
    }
  } else if (type < 27) {
    // Version 10-26
    switch (mode) {
      case QRMode.MODE_NUMBER: return 12;
      case QRMode.MODE_ALPHA_NUM: return 11;
      case QRMode.MODE_8BIT_BYTE: return 16;
      case QRMode.MODE_KANJI: return 10;
      default: throw new Error(`mode:${mode}`);
    }
  } else if (type < 41) {
    // Version 27-40
    switch (mode) {
      case QRMode.MODE_NUMBER: return 14;
      case QRMode.MODE_ALPHA_NUM: return 13;
      case QRMode.MODE_8BIT_BYTE: return 16;
      case QRMode.MODE_KANJI: return 12;
      default: throw new Error(`mode:${mode}`);
    }
  } else {
    throw new Error(`type:${type}`);
  }
}

/**
 * Calculate penalty score for mask pattern selection
 */
export function getLostPoint(qrcode: QRCodeInstance): number {
  const moduleCount = qrcode.getModuleCount();
  let lostPoint = 0;

  // LEVEL1: Same color in a row/column (5+ consecutive)
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      let sameCount = 0;
      const dark = qrcode.isDark(row, col);

      for (let r = -1; r <= 1; r += 1) {
        if (row + r < 0 || moduleCount <= row + r) continue;

        for (let c = -1; c <= 1; c += 1) {
          if (col + c < 0 || moduleCount <= col + c) continue;
          if (r === 0 && c === 0) continue;

          if (dark === qrcode.isDark(row + r, col + c)) {
            sameCount += 1;
          }
        }
      }

      if (sameCount > 5) {
        lostPoint += 3 + sameCount - 5;
      }
    }
  }

  // LEVEL2: 2x2 blocks of same color
  for (let row = 0; row < moduleCount - 1; row += 1) {
    for (let col = 0; col < moduleCount - 1; col += 1) {
      let count = 0;
      if (qrcode.isDark(row, col)) count += 1;
      if (qrcode.isDark(row + 1, col)) count += 1;
      if (qrcode.isDark(row, col + 1)) count += 1;
      if (qrcode.isDark(row + 1, col + 1)) count += 1;
      if (count === 0 || count === 4) {
        lostPoint += 3;
      }
    }
  }

  // LEVEL3: Finder-like patterns
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount - 6; col += 1) {
      if (
        qrcode.isDark(row, col) &&
        !qrcode.isDark(row, col + 1) &&
        qrcode.isDark(row, col + 2) &&
        qrcode.isDark(row, col + 3) &&
        qrcode.isDark(row, col + 4) &&
        !qrcode.isDark(row, col + 5) &&
        qrcode.isDark(row, col + 6)
      ) {
        lostPoint += 40;
      }
    }
  }

  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount - 6; row += 1) {
      if (
        qrcode.isDark(row, col) &&
        !qrcode.isDark(row + 1, col) &&
        qrcode.isDark(row + 2, col) &&
        qrcode.isDark(row + 3, col) &&
        qrcode.isDark(row + 4, col) &&
        !qrcode.isDark(row + 5, col) &&
        qrcode.isDark(row + 6, col)
      ) {
        lostPoint += 40;
      }
    }
  }

  // LEVEL4: Dark/light ratio deviation from 50%
  let darkCount = 0;
  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount; row += 1) {
      if (qrcode.isDark(row, col)) {
        darkCount += 1;
      }
    }
  }

  const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
  lostPoint += ratio * 10;

  return lostPoint;
}

export const QRUtil = {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getPatternPosition,
  getMaskFunction,
  getErrorCorrectPolynomial,
  getLengthInBits,
  getLostPoint,
};
