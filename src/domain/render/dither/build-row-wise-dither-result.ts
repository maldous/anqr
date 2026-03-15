import type { DitherResult, RGB } from '../../../modules/dither-algorithms/types';

export function buildRowWiseDitherResult(
  params: Readonly<{
    height: number;
    resolvePixel: (x: number, y: number) => { color: RGB; isDark: boolean };
    width: number;
  }>
): DitherResult {
  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  for (let y = 0; y < params.height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < params.width; x++) {
      const pixel = params.resolvePixel(x, y);
      matrixRow.push(pixel.isDark);
      colorRow.push(pixel.color);
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
