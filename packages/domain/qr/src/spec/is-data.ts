import { isLocked } from "./is-locked";

/**
 * Check if a position is a data module (not structural)
 */
export function isData(row: number, col: number, moduleCount: number, version: number): boolean {
  return !isLocked(row, col, moduleCount, version);
}
