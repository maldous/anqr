import type { RSBasisVector } from "./rs-basis";

export function eliminatePixelFromOtherRows(
  matrix: Uint32Array[],
  resultVectors: RSBasisVector[],
  pivotRow: number,
  numVectors: number,
  wordIndex: number,
  bitIndex: number,
  bitsetWordCount: number,
): void {
  const pivotMatrixRow = matrix[pivotRow];
  for (let r = 0; r < numVectors; r++) {
    if (r !== pivotRow && ((matrix[r][wordIndex] >>> bitIndex) & 1) === 1) {
      const row = matrix[r];
      for (let word = 0; word < bitsetWordCount; word++) {
        row[word] ^= pivotMatrixRow[word];
      }
      for (let i = 0; i < resultVectors[r].blockBits.length; i++) {
        resultVectors[r].blockBits[i] ^= resultVectors[pivotRow].blockBits[i];
      }
    }
  }
}
