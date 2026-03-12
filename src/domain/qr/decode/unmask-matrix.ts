import { getVersionFromModuleCount, isStructuralModule } from '../../../modules/qr-spec/index';
import { getMaskFunction } from './get-mask-function';

/**
 * Unmask the data modules in the matrix
 */
export function unmaskMatrix(
  matrix: boolean[][],
  maskPattern: number,
  moduleCount: number
): boolean[][] {
  const maskFunc = getMaskFunction(maskPattern);
  const unmasked: boolean[][] = [];
  const version = getVersionFromModuleCount(moduleCount);

  for (let row = 0; row < moduleCount; row++) {
    const unmaskedRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      let value = matrix[row]?.[col] ?? false;

      // Only unmask data modules (not function patterns)
      if (!isStructuralModule(row, col, moduleCount, version)) {
        if (maskFunc(row, col)) {
          value = !value;
        }
      }

      unmaskedRow.push(value);
    }
    unmasked.push(unmaskedRow);
  }

  return unmasked;
}
