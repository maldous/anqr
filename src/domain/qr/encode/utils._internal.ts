import type { QRCodeInstance } from '../../../modules/qr-encoder/types';
import { QRMode } from '../../../modules/qr-encoder/types';

// Lookup table: mode -> [version 1-9, version 10-26, version 27-40]
const LENGTH_BITS: Record<number, [number, number, number]> = {
  [QRMode.MODE_NUMBER]: [10, 12, 14],
  [QRMode.MODE_ALPHA_NUM]: [9, 11, 13],
  [QRMode.MODE_8BIT_BYTE]: [8, 16, 16],
  [QRMode.MODE_KANJI]: [8, 10, 12],
};

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

export function count2x2DarkModules(qrcode: QRCodeInstance, row: number, col: number): number {
  let count = 0;
  if (qrcode.isDark(row, col)) count += 1;
  if (qrcode.isDark(row + 1, col)) count += 1;
  if (qrcode.isDark(row, col + 1)) count += 1;
  if (qrcode.isDark(row + 1, col + 1)) count += 1;
  return count;
}

// LEVEL2: 2x2 blocks of same color
function penaltyLevel2Blocks(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
  for (let row = 0; row < moduleCount - 1; row += 1) {
    for (let col = 0; col < moduleCount - 1; col += 1) {
      const count = count2x2DarkModules(qrcode, row, col);
      if (count === 0 || count === 4) {
        penalty += 3;
      }
    }
  }
  return penalty;
}

export function penaltyLevel3Horizontal(qrcode: QRCodeInstance, moduleCount: number): number {
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
  return penalty;
}

export function penaltyLevel3Vertical(qrcode: QRCodeInstance, moduleCount: number): number {
  let penalty = 0;
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

// LEVEL3: Finder-like patterns
function penaltyLevel3FinderLike(qrcode: QRCodeInstance, moduleCount: number): number {
  return penaltyLevel3Horizontal(qrcode, moduleCount) + penaltyLevel3Vertical(qrcode, moduleCount);
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

export { LENGTH_BITS, countSameNeighbors, penaltyLevel1AdjacentModules, penaltyLevel2Blocks, penaltyLevel3FinderLike, penaltyLevel4Ratio };
