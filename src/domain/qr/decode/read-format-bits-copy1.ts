import { readBitFromMatrix } from './read-bit-from-matrix';
import type { BitTrace } from './bit-trace';

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
