import type { DarkModuleReader } from "./verify.types";

export function isAlternatingLine(
  isDark: DarkModuleReader["isDark"],
  row: number,
  colStart: number,
  colEnd: number,
): boolean {
  let previous = isDark(row, colStart);
  for (let col = colStart + 1; col <= colEnd; col++) {
    const current = isDark(row, col);
    if (current === previous) return false;
    previous = current;
  }
  return true;
}
