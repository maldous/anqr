export function bitsToMatrix(bits: Uint8Array, size: number): boolean[][] {
  const matrix: boolean[][] = new Array(size);
  for (let y = 0; y < size; y++) {
    const row: boolean[] = new Array(size);
    const base = y * size;
    for (let x = 0; x < size; x++) {
      row[x] = bits[base + x] === 1;
    }
    matrix[y] = row;
  }
  return matrix;
}
