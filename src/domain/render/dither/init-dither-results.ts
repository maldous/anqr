import type { RGB } from '../../../modules/dither-algorithms/types';

export function initDitherResults(
  width: number,
  height: number
): { resultMatrix: boolean[][]; resultColors: RGB[][] } {
  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];
  for (let y = 0; y < height; y++) {
    resultMatrix.push(Array.from({ length: width }, () => false));
    resultColors.push(Array.from({ length: width }, (): RGB => ({ r: 255, g: 255, b: 255 })));
  }
  return { resultMatrix, resultColors };
}
