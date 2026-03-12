import { isLocked } from './is-locked';

/**
 * Check if a module is a structural element
 * Alias for isLocked for semantic clarity in different contexts
 */
export function isStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  return isLocked(row, col, moduleCount, version);
}
