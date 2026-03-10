/**
 * QR Utility Functions
 * Pattern positions, BCH encoding, mask functions, and lost point calculation
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ENCODER');

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

// Lookup table: mode -> [version 1-9, version 10-26, version 27-40]
const LENGTH_BITS: Record<number, [number, number, number]> = {
  [QRMode.MODE_NUMBER]: [10, 12, 14],
  [QRMode.MODE_ALPHA_NUM]: [9, 11, 13],
  [QRMode.MODE_8BIT_BYTE]: [8, 16, 16],
  [QRMode.MODE_KANJI]: [8, 10, 12],
};

/**
 * Get character count indicator length in bits
 */
export function getLengthInBits(mode: number, type: number): number {
  if (type < 1 || type >= 41) throw new Error(`type:${type}`);
  const entry = LENGTH_BITS[mode];
  if (!entry) throw new Error(`mode:${mode}`);
  const versionRange = type < 10 ? 0 : type < 27 ? 1 : 2;
  return entry[versionRange];
}

/**
 * Count how many of the 8 neighbors around (row, col) share the same dark/light value.
 */
function countSameNeighbors(
  qrcode: QRCodeInstance,
  row: number,
  col: number,
  moduleCount: number
): number {
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

  return sameCount;
}

// LEVEL1: Same color in a row/column (5+ consecutive)
function penaltyLevel1AdjacentModules(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      const sameCount = countSameNeighbors(qrcode, row, col, moduleCount);

      if (sameCount > 5) {
        penalty += 3 + sameCount - 5;
      }
    }
  }
  return penalty;
}

// LEVEL2: 2x2 blocks of same color
function penaltyLevel2Blocks(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
  for (let row = 0; row < moduleCount - 1; row += 1) {
    for (let col = 0; col < moduleCount - 1; col += 1) {
      let count = 0;
      if (qrcode.isDark(row, col)) count += 1;
      if (qrcode.isDark(row + 1, col)) count += 1;
      if (qrcode.isDark(row, col + 1)) count += 1;
      if (qrcode.isDark(row + 1, col + 1)) count += 1;
      if (count === 0 || count === 4) {
        penalty += 3;
      }
    }
  }
  return penalty;
}

// LEVEL3: Finder-like patterns
function penaltyLevel3FinderLike(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
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
        penalty += 40;
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
        penalty += 40;
      }
    }
  }
  return penalty;
}

// LEVEL4: Dark/light ratio deviation from 50%
function penaltyLevel4Ratio(qrcode: QRCodeInstance, moduleCount: number): number {
  let darkCount = 0;
  for (let col = 0; col < moduleCount; col += 1) {
    for (let row = 0; row < moduleCount; row += 1) {
      if (qrcode.isDark(row, col)) {
        darkCount += 1;
      }
    }
  }

  const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
  return ratio * 10;
}

/**
 * Calculate penalty score for mask pattern selection
 */
export function getLostPoint(qrcode: QRCodeInstance): number {
  const moduleCount = qrcode.getModuleCount();
  return (
    penaltyLevel1AdjacentModules(qrcode, moduleCount) +
    penaltyLevel2Blocks(qrcode, moduleCount) +
    penaltyLevel3FinderLike(qrcode, moduleCount) +
    penaltyLevel4Ratio(qrcode, moduleCount)
  );
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
