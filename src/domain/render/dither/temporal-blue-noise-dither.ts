import type { ColorMode, DitherResult } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile } from '../../../modules/dither-algorithms/utils';
import { buildBinaryDitherResult } from './build-binary-dither-result';

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

  return buildBinaryDitherResult({
    height,
    imageData,
    resolveThreshold: (x, y) => {
      const nx = x % tileSize;
      const ny = y % tileSize;
      const noiseIdx = (ny * tileSize + nx + offset) % (tileSize * tileSize);
      return tile[noiseIdx];
    },
    width,
  });
}
