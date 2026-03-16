export function flipComponentCells(
  grid: boolean[][],
  moduleCount: number,
  cells: number[],
  targetValue: boolean,
): void {
  for (const idx of cells) {
    const r = Math.floor(idx / moduleCount);
    const c = idx % moduleCount;
    if (grid[r]) grid[r][c] = !targetValue;
  }
}
