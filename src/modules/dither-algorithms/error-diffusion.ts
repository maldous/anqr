/**
 * Error Diffusion Dithering
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DITHER');

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

interface QuantizedPixelResult {
  isDark: boolean;
  color: RGB;
  errorR: number;
  errorG: number;
  errorB: number;
}

function quantizeErrorDiffusionPixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number
): QuantizedPixelResult {
  if (colorMode === 'bw') {
    const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
    const newVal = gray > 0.5 ? 1 : 0;
    const error = (gray - newVal) * strengthFactor;
    return {
      isDark: newVal === 0,
      color: { r: newVal * 255, g: newVal * 255, b: newVal * 255 },
      errorR: error,
      errorG: error,
      errorB: error,
    };
  } else if (colorMode === 'grayscale') {
    const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
    const newVal = Math.round(gray / step) * step;
    const error = (gray - newVal) * strengthFactor;
    const grayByte = Math.round(clamp01(newVal) * 255);
    return {
      isDark: newVal < 0.5,
      color: { r: grayByte, g: grayByte, b: grayByte },
      errorR: error,
      errorG: error,
      errorB: error,
    };
  }
  const newR = Math.round(pixel.r / step) * step;
  const newG = Math.round(pixel.g / step) * step;
  const newB = Math.round(pixel.b / step) * step;
  return {
    isDark: rgbToGray(newR, newG, newB) < 0.5,
    color: {
      r: Math.round(clamp01(newR) * 255),
      g: Math.round(clamp01(newG) * 255),
      b: Math.round(clamp01(newB) * 255),
    },
    errorR: (pixel.r - newR) * strengthFactor,
    errorG: (pixel.g - newG) * strengthFactor,
    errorB: (pixel.b - newB) * strengthFactor,
  };
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
      const q = quantizeErrorDiffusionPixel(pixels[y][x], colorMode, step, strengthFactor);
      resultMatrix[y][x] = q.isDark;
      resultColors[y][x] = q.color;
      distributeErrorWithKernel({
        pixels,
        x,
        y,
        width,
        height,
        errorR: q.errorR,
        errorG: q.errorG,
        errorB: q.errorB,
        kernel,
        leftToRight,
      });
    }
  }

  return { matrix: resultMatrix, colors: resultColors };
}
