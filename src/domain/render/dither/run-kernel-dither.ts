import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { copyImageToPixels } from './copy-image-to-pixels';
import type { DiffusionPixelResult } from './diffusion-pixel-result';
import type { DiffusionKernelDef } from './kernels.types';
import { runDiffusionDither } from './run-diffusion-dither';

export function runKernelDither(
  params: Readonly<{
    height: number;
    imageData: Float32Array[];
    kernel: DiffusionKernelDef;
    quantize: (
      pixel: { r: number; g: number; b: number },
      x: number,
      y: number
    ) => DiffusionPixelResult;
    serpentine: boolean;
    transform?: (r: number, g: number, b: number) => { r: number; g: number; b: number };
    width: number;
  }>
): DitherResult {
  const pixels = copyImageToPixels(params.imageData, params.width, params.height, params.transform);

  return runDiffusionDither({
    height: params.height,
    kernel: params.kernel,
    leftPixelAt: (x, y) => pixels[y][x],
    pixels,
    quantize: params.quantize,
    serpentine: params.serpentine,
    width: params.width,
  });
}
