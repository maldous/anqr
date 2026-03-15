import { isStructuralModule } from './is-structural-module';

/**
 * Check if a module position is "locked" (structural, should not be modified by overlay)
 * Locked positions include: finder patterns, timing, alignment, format info, version info, quiet zone separators
 */
export function isLocked(row: number, col: number, moduleCount: number, version: number): boolean {
  return isStructuralModule(row, col, moduleCount, version);
}
