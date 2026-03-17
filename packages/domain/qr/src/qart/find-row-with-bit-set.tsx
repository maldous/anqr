export function findRowWithBitSet(
  matrix: Uint32Array[],
  startRow: number,
  endRow: number,
  wordIndex: number,
  bitIndex: number,
): number {
  for (let r = startRow; r < endRow; r++) {
    if (((matrix[r][wordIndex] >>> bitIndex) & 1) === 1) {
      return r;
    }
  }
  return -1;
}
