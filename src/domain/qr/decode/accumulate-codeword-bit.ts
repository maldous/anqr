import type { BitMatrix } from "./bit-matrix";

/**
 * Accumulate a single data bit from the QR matrix into the codeword buffer.
 */
export function accumulateCodewordBit(
  bitMatrix: BitMatrix,
  functionPattern: BitMatrix,
  j: number,
  col: number,
  i: number,
  state: { currentByte: number; bitsRead: number; resultOffset: number },
  result: number[],
): void {
  if (functionPattern.get(j - col, i)) return;
  state.bitsRead++;
  state.currentByte <<= 1;
  if (bitMatrix.get(j - col, i)) {
    state.currentByte |= 1;
  }
  if (state.bitsRead === 8) {
    result[state.resultOffset++] = state.currentByte;
    state.bitsRead = 0;
    state.currentByte = 0;
  }
}
