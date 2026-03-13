import type { DarkModuleReader } from './verify.types';

export function isAlternatingCol(
  isDark: DarkModuleReader['isDark'],
  col: number,
  rowStart: number,
  rowEnd: number
): boolean {
  let previous = isDark(rowStart, col);
  for (let row = rowStart + 1; row <= rowEnd; row++) {
    const current = isDark(row, col);
    if (current === previous) return false;
    previous = current;
  }
  return true;
}
