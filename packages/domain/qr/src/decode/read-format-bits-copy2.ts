import { readBitFromMatrix } from "./read-bit-from-matrix";
import type { BitTrace } from "./bit-trace";

export function readFormatBitsCopy2(
  matrix: boolean[][],
  moduleCount: number,
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
