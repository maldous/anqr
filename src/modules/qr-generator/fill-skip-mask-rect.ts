export function fillSkipMaskRect(
  skipMask: Uint8Array,
  moduleCount: number,
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number
): void {
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      skipMask[row * moduleCount + col] = 1;
    }
  }
}
