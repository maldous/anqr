import { isFinderPattern } from "../qr-spec";

export function isFinderModuleOrSeparator(
  row: number,
  col: number,
  moduleCount: number,
  separatorsOnly: boolean = false,
): boolean {
  const isFinderSeparator =
    (row === 7 && col <= 7) ||
    (col === 7 && row <= 7) ||
    (row === 7 && col >= moduleCount - 8) ||
    (col === moduleCount - 8 && row <= 7) ||
    (row === moduleCount - 8 && col <= 7) ||
    (col === 7 && row >= moduleCount - 8);
  if (separatorsOnly) return isFinderSeparator;
  return isFinderPattern(row, col, moduleCount) || isFinderSeparator;
}
