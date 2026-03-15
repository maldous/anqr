import { isStructuralModule } from '../spec/is-structural-module';

/**
 * Check if a module is structural (not data/ECC)
 */
export function isStructural(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  return isStructuralModule(row, col, moduleCount, version);
}
