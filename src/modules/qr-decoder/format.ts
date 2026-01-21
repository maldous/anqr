/**
 * QR Format and Version Info Decoding
 * Reads format bits to get ECC level and mask pattern
 */

// Shared logger
import { qrDecoderLog as log } from '../qr-analyzer/logger';
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

  // Collect per-bit trace for debugging
  const trace1: Array<{ bit: number; row: number; col: number; value: boolean }> = [];
  const trace2: Array<{ bit: number; row: number; col: number; value: boolean }> = [];

  // ========================================
  // Copy 1: Around top-left finder pattern
  // ========================================
  let bits1 = 0;

  // Bits 0-5: column 8, rows 0-5
  for (let i = 0; i <= 5; i++) {
    const row = i;
    const col = 8;
    const value = matrix[row]?.[col] ?? false;
    if (value) bits1 |= 1 << i;
    trace1.push({ bit: i, row, col, value });
  }

  // Bit 6: column 8, row 7 (row 6 is timing pattern)
  {
    const row = 7;
    const col = 8;
    const value = matrix[row]?.[col] ?? false;
    if (value) bits1 |= 1 << 6;
    trace1.push({ bit: 6, row, col, value });
  }

  // Bit 7: column 8, row 8
  {
    const row = 8;
    const col = 8;
    const value = matrix[row]?.[col] ?? false;
    if (value) bits1 |= 1 << 7;
    trace1.push({ bit: 7, row, col, value });
  }

  // Bit 8: row 8, column 7
  {
    const row = 8;
    const col = 7;
    const value = matrix[row]?.[col] ?? false;
    if (value) bits1 |= 1 << 8;
    trace1.push({ bit: 8, row, col, value });
  }

  // Bits 9-14: row 8, columns 5-0
  for (let i = 9; i <= 14; i++) {
    const row = 8;
    const col = 14 - i; // i=9 → col 5, i=10 → col 4, ..., i=14 → col 0
    const value = matrix[row]?.[col] ?? false;
    if (value) bits1 |= 1 << i;
    trace1.push({ bit: i, row, col, value });
  }

  // ========================================
  // Copy 2: Around top-right and bottom-left
  // ========================================
  let bits2 = 0;

  // Bits 0-7: row 8, columns N-1 to N-8
  for (let i = 0; i <= 7; i++) {
    const row = 8;
    const col = moduleCount - 1 - i; // i=0 → col N-1, i=7 → col N-8
    const value = matrix[row]?.[col] ?? false;
    if (value) bits2 |= 1 << i;
    trace2.push({ bit: i, row, col, value });
  }

  // Bits 8-14: column 8, rows N-7 to N-1
  for (let i = 8; i <= 14; i++) {
    const row = moduleCount - 15 + i; // i=8 → row N-7, i=14 → row N-1
    const col = 8;
    const value = matrix[row]?.[col] ?? false;
    if (value) bits2 |= 1 << i;
    trace2.push({ bit: i, row, col, value });
  }

  log('format', 'Read format bits with trace', {
    bits1: bits1.toString(2).padStart(15, '0'),
    bits2: bits2.toString(2).padStart(15, '0'),
    bits1Hex: '0x' + bits1.toString(16).padStart(4, '0'),
    bits2Hex: '0x' + bits2.toString(16).padStart(4, '0'),
    moduleCount,
    trace1: trace1.map((t) => `bit${t.bit}:(${t.row},${t.col})=${t.value ? 1 : 0}`).join(' '),
    trace2: trace2.map((t) => `bit${t.bit}:(${t.row},${t.col})=${t.value ? 1 : 0}`).join(' '),
  });

  // Try to find a match with error correction
  let bestMatch: FormatInfo | null = null;
  let bestDistance = 4; // Maximum correctable errors for BCH(15,5) is 3
  let bestDistCopy1 = 15;
  let bestDistCopy2 = 15;
  let bestFromCopy = 0;

  for (const [pattern, info] of FORMAT_INFO_DECODE_TABLE) {
    const d1 = hammingDistance(bits1, pattern);
    const d2 = hammingDistance(bits2, pattern);
    const minD = Math.min(d1, d2);

    if (minD < bestDistance) {
      bestDistance = minD;
      bestDistCopy1 = d1;
      bestDistCopy2 = d2;
      bestFromCopy = d1 <= d2 ? 1 : 2;
      bestMatch = info;
    }
  }

  if (bestMatch) {
    const eccChar = ECC_LEVEL_MAP[bestMatch.eccLevel];
    log('format', 'Decoded format info', {
      eccLevel: bestMatch.eccLevel,
      eccChar,
      maskPattern: bestMatch.maskPattern,
      hammingDistance: bestDistance,
      hammingDistCopy1: bestDistCopy1,
      hammingDistCopy2: bestDistCopy2,
      usedCopy: bestFromCopy,
    });
  } else {
    log('format', 'Failed to decode format info', {
      bits1: bits1.toString(2).padStart(15, '0'),
      bits2: bits2.toString(2).padStart(15, '0'),
      bits1Hex: '0x' + bits1.toString(16).padStart(4, '0'),
      bits2Hex: '0x' + bits2.toString(16).padStart(4, '0'),
    });
  }

  return bestMatch;
}

/**
 * Read version info from the matrix (for versions 7+)
 */
export function readVersionInfo(matrix: boolean[][], moduleCount: number): number | null {
  const version = (moduleCount - 17) / 4;

  // Version info only exists for version 7+
  if (version < 7) return version;

  // Read version info from bottom-left (6x3 block)
  let bits1 = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[moduleCount - 11 + j]?.[i]) {
        bits1 |= 1 << (i * 3 + j);
      }
    }
  }

  // Read version info from top-right (3x6 block)
  let bits2 = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[i]?.[moduleCount - 11 + j]) {
        bits2 |= 1 << (i * 3 + j);
      }
    }
  }

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
