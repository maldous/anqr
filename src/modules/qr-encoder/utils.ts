/**
 * QR Utility Functions
 * Pattern positions, BCH encoding, mask functions, and lost point calculation
 */

// Import from canonical sources in qr-spec
import {
  getBCHTypeInfo as getBCHTypeInfoFromSpec,
  getBCHTypeNumber as getBCHTypeNumberFromSpec,
  getMaskFunction as getMaskFunctionFromSpec,
  getAlignmentPositions as getPatternPositionFromSpec,
} from '../qr-spec';
import { gexp, qrPolynomial } from './math';
import type { QRCodeInstance, QRPolynomial } from './types';
import { QRMode } from './types';

// Re-export from qr-spec for backward compatibility
export const getBCHTypeInfo = getBCHTypeInfoFromSpec;
export const getBCHTypeNumber = getBCHTypeNumberFromSpec;
export const getMaskFunction = getMaskFunctionFromSpec;

/**
 * Get alignment pattern positions for a version
 * Note: Uses 1-indexed version (typeNumber), converts to 0-indexed for qr-spec
 */
export function getPatternPosition(typeNumber: number): number[] {
  return getPatternPositionFromSpec(typeNumber);
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
      case QRMode.MODE_NUMBER:
        return 10;
      case QRMode.MODE_ALPHA_NUM:
        return 9;
      case QRMode.MODE_8BIT_BYTE:
        return 8;
      case QRMode.MODE_KANJI:
        return 8;
      default:
        throw new Error(`mode:${mode}`);
    }
  } else if (type < 27) {
    // Version 10-26
    switch (mode) {
      case QRMode.MODE_NUMBER:
        return 12;
      case QRMode.MODE_ALPHA_NUM:
        return 11;
      case QRMode.MODE_8BIT_BYTE:
        return 16;
      case QRMode.MODE_KANJI:
        return 10;
      default:
        throw new Error(`mode:${mode}`);
    }
  } else if (type < 41) {
    // Version 27-40
    switch (mode) {
      case QRMode.MODE_NUMBER:
        return 14;
      case QRMode.MODE_ALPHA_NUM:
        return 13;
      case QRMode.MODE_8BIT_BYTE:
        return 16;
      case QRMode.MODE_KANJI:
        return 12;
      default:
        throw new Error(`mode:${mode}`);
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
