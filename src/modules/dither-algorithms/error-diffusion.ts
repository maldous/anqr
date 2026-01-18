/**
 * Error Diffusion Dithering
 */

import { DIFFUSION_KERNELS, type DiffusionKernelDef } from './kernels';
import type { ColorMode, DiffusionKernel, DitherResult, RGB } from './types';
import { clamp01, rgbToGray } from './utils';

/** Options for error diffusion dithering */
interface ErrorDiffusionOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

/** Options for distributing error to neighboring pixels */
interface DistributeErrorOptions {
  pixels: { r: number; g: number; b: number }[][];
  x: number;
  y: number;
  width: number;
  height: number;
  errorR: number;
  errorG: number;
  errorB: number;
  kernel: DiffusionKernelDef;
  leftToRight: boolean;
}

/** Distribute error to neighboring pixels */
export function distributeErrorWithKernel(opts: DistributeErrorOptions): void {
  const { pixels, x, y, width, height, errorR, errorG, errorB, kernel, leftToRight } = opts;
  for (let ky = 0; ky < kernel.matrix.length; ky++) {
    for (let kx = 0; kx < kernel.matrix[ky].length; kx++) {
      const weight = kernel.matrix[ky][kx];
      if (weight === 0) continue;

      let offsetX = kx - kernel.offset;
      if (!leftToRight) offsetX = -offsetX;

      const nx = x + offsetX;
      const ny = y + ky;

      if (nx >= 0 && nx < width && ny < height) {
        const factor = weight / kernel.divisor;
        pixels[ny][nx].r += errorR * factor;
        pixels[ny][nx].g += errorG * factor;
        pixels[ny][nx].b += errorB * factor;
      }
    }
  }
}

/** Apply error diffusion dithering */
export function errorDiffusion(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: ErrorDiffusionOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);

  // Make a copy of image data as floating point for error accumulation
  const pixels: { r: number; g: number; b: number }[][] = [];
  for (let y = 0; y < height; y++) {
    const row: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      row.push({
        r: imageData[y][idx],
        g: imageData[y][idx + 1],
        b: imageData[y][idx + 2],
      });
    }
    pixels.push(row);
  }

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  // Initialize result arrays
  for (let y = 0; y < height; y++) {
    resultMatrix.push(new Array(width).fill(false));
    resultColors.push(new Array(width).fill({ r: 255, g: 255, b: 255 }));
  }

  // Process each pixel
  for (let y = 0; y < height; y++) {
    const leftToRight = serpentine ? y % 2 === 0 : true;
    const startX = leftToRight ? 0 : width - 1;
    const endX = leftToRight ? width : -1;
    const deltaX = leftToRight ? 1 : -1;

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const pixel = pixels[y][x];

      if (colorMode === 'bw') {
        // Black & white
        const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
        const newVal = gray > 0.5 ? 1 : 0;
        const error = (gray - newVal) * strengthFactor;

        resultMatrix[y][x] = newVal === 0;
        resultColors[y][x] = {
          r: newVal * 255,
          g: newVal * 255,
          b: newVal * 255,
        };

        distributeErrorWithKernel({
          pixels,
          x,
          y,
          width,
          height,
          errorR: error,
          errorG: error,
          errorB: error,
          kernel,
          leftToRight,
        });
      } else if (colorMode === 'grayscale') {
        // Grayscale with multiple levels
        const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
        const newVal = Math.round(gray / step) * step;
        const error = (gray - newVal) * strengthFactor;

        resultMatrix[y][x] = newVal < 0.5;
        const grayByte = Math.round(clamp01(newVal) * 255);
        resultColors[y][x] = { r: grayByte, g: grayByte, b: grayByte };

        distributeErrorWithKernel({
          pixels,
          x,
          y,
          width,
          height,
          errorR: error,
          errorG: error,
          errorB: error,
          kernel,
          leftToRight,
        });
      } else {
        // Color mode - process each channel
        const newR = Math.round(pixel.r / step) * step;
        const newG = Math.round(pixel.g / step) * step;
        const newB = Math.round(pixel.b / step) * step;

        const errR = (pixel.r - newR) * strengthFactor;
        const errG = (pixel.g - newG) * strengthFactor;
        const errB = (pixel.b - newB) * strengthFactor;

        const brightness = rgbToGray(newR, newG, newB);
        resultMatrix[y][x] = brightness < 0.5;

        resultColors[y][x] = {
          r: Math.round(clamp01(newR) * 255),
          g: Math.round(clamp01(newG) * 255),
          b: Math.round(clamp01(newB) * 255),
        };

        distributeErrorWithKernel({
          pixels,
          x,
          y,
          width,
          height,
          errorR: errR,
          errorG: errG,
          errorB: errB,
          kernel,
          leftToRight,
        });
      }
    }
  }

  return { matrix: resultMatrix, colors: resultColors };
}
