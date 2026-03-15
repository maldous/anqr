import type { RSBasisBlock } from './types';
import { qartLog } from './qart-log';

export function gaussJordanEliminate(
  _basis: RSBasisBlock[],
  _pixelImportance: number[]
): RSBasisBlock[] {
  qartLog.warn('gaussJordanEliminate not yet implemented');
  return [];
}
