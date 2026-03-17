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
