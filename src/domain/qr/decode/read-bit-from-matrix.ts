export function readBitFromMatrix(matrix: boolean[][], row: number, col: number): boolean {
  return matrix[row]?.[col] ?? false;
}
