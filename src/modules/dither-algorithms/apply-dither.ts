/**
 * Apply Dither
 * Main entry point for applying dithering based on kind
 */

import {
  adaptiveThresholdDither,
  blueNoiseDither,
  blueNoiseErrorDiffusion,
  edgeAwareDither,
  perceptualDither,
  screenedBlueNoiseDither,
} from './advanced';
import { errorDiffusion } from './error-diffusion';
import { CLUSTERED_DOT, VOID_CLUSTER } from './matrices';
import { gaussianNoiseDither, triangularNoiseDither, whiteNoiseDither } from './noise';
import { bayerDither, orderedDither } from './ordered';
import { temporalBlueNoiseDither } from './temporal';
import type { DitherOptions, DitherResult } from './types';
import { imageDataToFloat } from './utils';

/** Apply dithering based on kind */
export function applyDither(imageData: ImageData, options: DitherOptions): DitherResult {
  const floatData = imageDataToFloat(imageData);
  const { width, height } = imageData;

  switch (options.kind) {
    case 'ordered_bayer': {
      const bayerSizeMap: Record<string, 2 | 4 | 8> = { bayer2: 2, bayer4: 4, bayer8: 8 };
      const bayerSize = bayerSizeMap[options.orderedMatrix ?? ''] ?? 4;
      return bayerDither(floatData, width, height, bayerSize, options.levels, options.strength);
    }

    case 'ordered_clustered':
      return orderedDither(
        floatData,
        width,
        height,
        CLUSTERED_DOT,
        options.levels,
        options.strength
      );

    case 'ordered_void_cluster':
      return orderedDither(
        floatData,
        width,
        height,
        VOID_CLUSTER,
        options.levels,
        options.strength
      );

    case 'blue_noise':
    case 'blue_noise_threshold':
      return blueNoiseDither(floatData, width, height, {
        tileSize: options.blueNoiseTileSize,
        seed: options.blueNoiseSeed,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'white_noise':
      return whiteNoiseDither(
        floatData,
        width,
        height,
        options.blueNoiseSeed,
        options.strength,
        options.colorMode
      );

    case 'gaussian_noise':
      return gaussianNoiseDither(
        floatData,
        width,
        height,
        options.blueNoiseSeed,
        options.strength,
        options.colorMode
      );

    case 'triangular_noise':
      return triangularNoiseDither(
        floatData,
        width,
        height,
        options.blueNoiseSeed,
        options.strength,
        options.colorMode
      );

    case 'blue_noise_error_diffusion':
      return blueNoiseErrorDiffusion(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
        tileSize: options.blueNoiseTileSize,
        seed: options.blueNoiseSeed,
      });

    case 'screened_blue_noise':
      return screenedBlueNoiseDither(floatData, width, height, {
        tileSize: options.blueNoiseTileSize,
        seed: options.blueNoiseSeed,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'perceptual':
      return perceptualDither(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'edge_aware':
      return edgeAwareDither(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'adaptive_threshold':
      return adaptiveThresholdDither(floatData, width, height, options.strength, options.colorMode);

    case 'temporal_blue_noise':
      return temporalBlueNoiseDither(
        floatData,
        width,
        height,
        0,
        options.blueNoiseTileSize,
        options.blueNoiseSeed,
        options.colorMode
      );

    default:
      return errorDiffusion(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });
  }
}
