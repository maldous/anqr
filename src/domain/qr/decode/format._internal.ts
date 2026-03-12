import { createLogger } from '../../../infra/logging/logger';
import type { FormatInfo } from '../../../modules/qr-decoder/types';

export const qrDecoderLog = createLogger('DECODER');

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

export type BitTrace = { bit: number; row: number; col: number; value: boolean };

export function readBitFromMatrix(matrix: boolean[][], row: number, col: number): boolean {
  return matrix[row]?.[col] ?? false;
}

export function readFormatBitsCopy1(matrix: boolean[][]): { bits: number; trace: BitTrace[] } {
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

export function readFormatBitsCopy2(
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

export function findBestFormatMatch(
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

export function readVersionBitsBottomLeft(matrix: boolean[][], moduleCount: number): number {
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

export function readVersionBitsTopRight(matrix: boolean[][], moduleCount: number): number {
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


export { FORMAT_INFO_DECODE_TABLE, initFormatTable, hammingDistance };

