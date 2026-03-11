/**
 * QR Format and Version Info Decoding
 * Reads format bits to get ECC level and mask pattern
 */

import { createLogger } from '../../lib/logger';

const qrDecoderLog = createLogger('DECODER');

import {
  getAlignmentPositions as getAlignmentPositionsFromSpec,
  getMaskFunction as getMaskFunctionFromSpec,
  getVersionFromModuleCount,
  isStructuralModule,
} from '../qr-spec';
import type { ECCLevelChar, FormatInfo } from './types';
import { ECC_LEVEL_MAP } from './types';

// Pre-computed valid format info patterns (15 bits after BCH encoding, XORed with mask 0x5412)
// Format: (ECC level << 3) | mask pattern, then BCH encoded, then XORed with 0x5412
const FORMAT_INFO_DECODE_TABLE: Map<number, FormatInfo> = new Map();

// Generate the decode table
function initFormatTable(): void {
  if (FORMAT_INFO_DECODE_TABLE.size > 0) return;

  // BCH(15,5) generator polynomial: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 0x537
  const G15 = 0x537;
  const G15_MASK = 0x5412;

  for (let eccLevel = 0; eccLevel < 4; eccLevel++) {
    for (let mask = 0; mask < 8; mask++) {
      const data = (eccLevel << 3) | mask;
      let bits = data << 10;

      // BCH division
      for (let i = 4; i >= 0; i--) {
        if (bits & (1 << (i + 10))) {
          bits ^= G15 << i;
        }
      }

      const encoded = ((data << 10) | bits) ^ G15_MASK;
      FORMAT_INFO_DECODE_TABLE.set(encoded, { eccLevel, maskPattern: mask });
    }
  }
}

/**
 * Count differing bits between two numbers
 */
function hammingDistance(a: number, b: number): number {
  let diff = a ^ b;
  let count = 0;
  while (diff) {
    count += diff & 1;
    diff >>>= 1;
  }
  return count;
}

type BitTrace = { bit: number; row: number; col: number; value: boolean };

function readBitFromMatrix(matrix: boolean[][], row: number, col: number): boolean {
  return matrix[row]?.[col] ?? false;
}

function readFormatBitsCopy1(matrix: boolean[][]): { bits: number; trace: BitTrace[] } {
  const trace: BitTrace[] = [];
  let bits = 0;

  // Bits 0-5: column 8, rows 0-5
  for (let i = 0; i <= 5; i++) {
    const value = readBitFromMatrix(matrix, i, 8);
    if (value) bits |= 1 << i;
    trace.push({ bit: i, row: i, col: 8, value });
  }

  // Bit 6: column 8, row 7 (row 6 is timing pattern)
  const v6 = readBitFromMatrix(matrix, 7, 8);
  if (v6) bits |= 1 << 6;
  trace.push({ bit: 6, row: 7, col: 8, value: v6 });

  // Bit 7: column 8, row 8
  const v7 = readBitFromMatrix(matrix, 8, 8);
  if (v7) bits |= 1 << 7;
  trace.push({ bit: 7, row: 8, col: 8, value: v7 });

  // Bit 8: row 8, column 7
  const v8 = readBitFromMatrix(matrix, 8, 7);
  if (v8) bits |= 1 << 8;
  trace.push({ bit: 8, row: 8, col: 7, value: v8 });

  // Bits 9-14: row 8, columns 5-0
  for (let i = 9; i <= 14; i++) {
    const col = 14 - i;
    const value = readBitFromMatrix(matrix, 8, col);
    if (value) bits |= 1 << i;
    trace.push({ bit: i, row: 8, col, value });
  }

  return { bits, trace };
}

function readFormatBitsCopy2(
  matrix: boolean[][],
  moduleCount: number
): { bits: number; trace: BitTrace[] } {
  const trace: BitTrace[] = [];
  let bits = 0;

  // Bits 0-7: row 8, columns N-1 to N-8
  for (let i = 0; i <= 7; i++) {
    const col = moduleCount - 1 - i;
    const value = readBitFromMatrix(matrix, 8, col);
    if (value) bits |= 1 << i;
    trace.push({ bit: i, row: 8, col, value });
  }

  // Bits 8-14: column 8, rows N-7 to N-1
  for (let i = 8; i <= 14; i++) {
    const row = moduleCount - 15 + i;
    const value = readBitFromMatrix(matrix, row, 8);
    if (value) bits |= 1 << i;
    trace.push({ bit: i, row, col: 8, value });
  }

  return { bits, trace };
}

function findBestFormatMatch(
  bits1: number,
  bits2: number
): {
  match: FormatInfo | null;
  distance: number;
  distCopy1: number;
  distCopy2: number;
  fromCopy: number;
} {
  let match: FormatInfo | null = null;
  let distance = 4;
  let distCopy1 = 15;
  let distCopy2 = 15;
  let fromCopy = 0;

  for (const [pattern, info] of FORMAT_INFO_DECODE_TABLE) {
    const d1 = hammingDistance(bits1, pattern);
    const d2 = hammingDistance(bits2, pattern);
    const minD = Math.min(d1, d2);

    if (minD < distance) {
      distance = minD;
      distCopy1 = d1;
      distCopy2 = d2;
      fromCopy = d1 <= d2 ? 1 : 2;
      match = info;
    }
  }

  return { match, distance, distCopy1, distCopy2, fromCopy };
}

/**
 * Read format info from the matrix
 * Format info is stored in two locations for redundancy
 *
 * The encoder writes format bits as follows (from setupTypeInfo in encoder.ts):
 *
 * Copy 1 (around top-left finder):
 *   - Vertical (column 8): bits 0-5 at rows 0-5, bits 6-7 at rows 7-8
 *   - Horizontal (row 8): bit 8 at col 7, bits 9-14 at cols 5-0
 *
 * Copy 2 (around top-right and bottom-left finders):
 *   - Horizontal (row 8): bits 0-7 at cols N-1 to N-8
 *   - Vertical (column 8): bits 8-14 at rows N-7 to N-1
 */
export function readFormatInfo(matrix: boolean[][], moduleCount: number): FormatInfo | null {
  initFormatTable();

  const copy1 = readFormatBitsCopy1(matrix);
  const copy2 = readFormatBitsCopy2(matrix, moduleCount);
  const bits1 = copy1.bits;
  const bits2 = copy2.bits;

  qrDecoderLog.trace('format: Read format bits with trace', {
    bits1: bits1.toString(2).padStart(15, '0'),
    bits2: bits2.toString(2).padStart(15, '0'),
    bits1Hex: `0x${bits1.toString(16).padStart(4, '0')}`,
    bits2Hex: `0x${bits2.toString(16).padStart(4, '0')}`,
    moduleCount,
    trace1: copy1.trace.map((t) => `bit${t.bit}:(${t.row},${t.col})=${t.value ? 1 : 0}`).join(' '),
    trace2: copy2.trace.map((t) => `bit${t.bit}:(${t.row},${t.col})=${t.value ? 1 : 0}`).join(' '),
  });

  const best = findBestFormatMatch(bits1, bits2);

  if (best.match) {
    const eccChar = ECC_LEVEL_MAP[best.match.eccLevel];
    qrDecoderLog.trace('format: Decoded format info', {
      eccLevel: best.match.eccLevel,
      eccChar,
      maskPattern: best.match.maskPattern,
      hammingDistance: best.distance,
      hammingDistCopy1: best.distCopy1,
      hammingDistCopy2: best.distCopy2,
      usedCopy: best.fromCopy,
    });
  } else {
    qrDecoderLog.trace('format: Failed to decode format info', {
      bits1: bits1.toString(2).padStart(15, '0'),
      bits2: bits2.toString(2).padStart(15, '0'),
      bits1Hex: `0x${bits1.toString(16).padStart(4, '0')}`,
      bits2Hex: `0x${bits2.toString(16).padStart(4, '0')}`,
    });
  }

  return best.match;
}

function readVersionBitsBottomLeft(matrix: boolean[][], moduleCount: number): number {
  let bits = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[moduleCount - 11 + j]?.[i]) {
        bits |= 1 << (i * 3 + j);
      }
    }
  }
  return bits;
}

function readVersionBitsTopRight(matrix: boolean[][], moduleCount: number): number {
  let bits = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[i]?.[moduleCount - 11 + j]) {
        bits |= 1 << (i * 3 + j);
      }
    }
  }
  return bits;
}

/**
 * Read version info from the matrix (for versions 7+)
 */
export function readVersionInfo(matrix: boolean[][], moduleCount: number): number | null {
  const version = (moduleCount - 17) / 4;

  // Version info only exists for version 7+
  if (version < 7) return version;

  const bits1 = readVersionBitsBottomLeft(matrix, moduleCount);
  const bits2 = readVersionBitsTopRight(matrix, moduleCount);

  // BCH(18,6) decoding with error correction
  // For simplicity, we'll check if the extracted version matches expected
  const extractedVersion1 = bits1 >> 12;
  const extractedVersion2 = bits2 >> 12;

  if (extractedVersion1 >= 7 && extractedVersion1 <= 40) {
    return extractedVersion1;
  }
  if (extractedVersion2 >= 7 && extractedVersion2 <= 40) {
    return extractedVersion2;
  }

  // Fall back to calculated version
  return version;
}

/**
 * Get ECC level character from format info
 */
export function getECCLevelChar(eccLevel: number): ECCLevelChar {
  return ECC_LEVEL_MAP[eccLevel] || 'M';
}

/**
 * Get mask function for a mask pattern
 * Re-exported from qr-spec for backward compatibility
 */
export const getMaskFunction = getMaskFunctionFromSpec;

/**
 * Unmask the data modules in the matrix
 */
export function unmaskMatrix(
  matrix: boolean[][],
  maskPattern: number,
  moduleCount: number
): boolean[][] {
  const maskFunc = getMaskFunction(maskPattern);
  const unmasked: boolean[][] = [];
  const version = getVersionFromModuleCount(moduleCount);

  for (let row = 0; row < moduleCount; row++) {
    const unmaskedRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      let value = matrix[row]?.[col] ?? false;

      // Only unmask data modules (not function patterns)
      if (!isStructuralModule(row, col, moduleCount, version)) {
        if (maskFunc(row, col)) {
          value = !value;
        }
      }

      unmaskedRow.push(value);
    }
    unmasked.push(unmaskedRow);
  }

  return unmasked;
}

// Use canonical source directly
const _getAlignmentPositions = getAlignmentPositionsFromSpec;
