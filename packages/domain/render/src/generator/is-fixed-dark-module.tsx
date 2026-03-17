export function isFixedDarkModule(row: number, col: number, moduleCount: number): boolean {
  return row === moduleCount - 8 && col === 8;
}
