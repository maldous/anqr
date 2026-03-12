import type { ColorMode, DitherResult } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile, rgbToGray } from '../../../modules/dither-algorithms/utils';

// ============================================================================
// Temporal Blue Noise Dithering Algorithm
// ============================================================================

/** Apply temporal blue noise dithering for animation frames */
export function temporalBlueNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  frameIndex: number,
  tileSize: number = 64,
  seed: number = 0,
  _colorMode: ColorMode = 'bw'
): DitherResult {
  const tile = generateBlueNoiseTile(tileSize, seed);
  const offset = (frameIndex * 17) % (tileSize * tileSize);

  const resultMatrix: boolean[][] = [];
  const resultColors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: { r: number; g: number; b: number }[] = [];

    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const nx = x % tileSize;
      const ny = y % tileSize;
      const noiseIdx = (ny * tileSize + nx + offset) % (tileSize * tileSize);
      const threshold = tile[noiseIdx];

      const isDark = gray < threshold;

      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
