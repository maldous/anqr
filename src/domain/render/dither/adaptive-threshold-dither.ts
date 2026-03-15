import type { ColorMode, DitherResult } from '../../../modules/dither-algorithms/types';
import { rgbToGray } from '../../../modules/dither-algorithms/utils';
import { buildBinaryDitherResult } from './build-binary-dither-result';

/** Adaptive threshold dithering - uses local mean for threshold */
export function adaptiveThresholdDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  strength: number = 100,
  _colorMode: ColorMode = 'bw'
): DitherResult {
  const strengthFactor = strength / 100;
  const blockSize = 8;

  // Compute integral image
  const integral: number[][] = [];
  for (let y = 0; y < height; y++) {
    integral.push(new Array(width).fill(0));
  }

  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const gray = rgbToGray(imageData[y][idx], imageData[y][idx + 1], imageData[y][idx + 2]);
      rowSum += gray;
      integral[y][x] = rowSum + (y > 0 ? integral[y - 1][x] : 0);
    }
  }

  const getSum = (x1: number, y1: number, x2: number, y2: number): number => {
    x1 = Math.max(0, x1);
    y1 = Math.max(0, y1);
    x2 = Math.min(width - 1, x2);
    y2 = Math.min(height - 1, y2);
    const a = y1 > 0 && x1 > 0 ? integral[y1 - 1][x1 - 1] : 0;
    const b = y1 > 0 ? integral[y1 - 1][x2] : 0;
    const c = x1 > 0 ? integral[y2][x1 - 1] : 0;
    const d = integral[y2][x2];
    return d - b - c + a;
  };

  return buildBinaryDitherResult({
    height,
    imageData,
    resolveThreshold: (x, y) => {
      const halfBlock = Math.floor(blockSize / 2);
      const x1 = x - halfBlock;
      const y1 = y - halfBlock;
      const x2 = x + halfBlock;
      const y2 = y + halfBlock;
      const area =
        (Math.min(x2, width - 1) - Math.max(x1, 0) + 1) *
        (Math.min(y2, height - 1) - Math.max(y1, 0) + 1);
      const localMean = getSum(x1, y1, x2, y2) / area;
      return localMean * (1 - 0.2 * strengthFactor);
    },
    width,
  });
}
