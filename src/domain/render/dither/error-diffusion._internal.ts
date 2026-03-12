import { type DiffusionKernelDef } from './kernels';
import type { ColorMode, DiffusionKernel, RGB } from '../../../modules/dither-algorithms/types';
import { clamp01, rgbToGray } from '../../../modules/dither-algorithms/utils';

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

export interface QuantizedPixelResult {
  isDark: boolean;
  color: RGB;
  errorR: number;
  errorG: number;
  errorB: number;
}

export function quantizeErrorDiffusionPixel(
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

export function copyImageToPixels(
  imageData: Float32Array[],
  width: number,
  height: number
): { r: number; g: number; b: number }[][] {
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
  return pixels;
}

export function initDitherResults(
  width: number,
  height: number
): { resultMatrix: boolean[][]; resultColors: RGB[][] } {
  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];
  for (let y = 0; y < height; y++) {
    resultMatrix.push(new Array(width).fill(false));
    resultColors.push(new Array(width).fill({ r: 255, g: 255, b: 255 }));
  }
  return { resultMatrix, resultColors };
}

export function getScanParams(
  y: number,
  width: number,
  serpentine: boolean
): { startX: number; endX: number; deltaX: number; leftToRight: boolean } {
  const leftToRight = serpentine ? y % 2 === 0 : true;
  return {
    leftToRight,
    startX: leftToRight ? 0 : width - 1,
    endX: leftToRight ? width : -1,
    deltaX: leftToRight ? 1 : -1,
  };
}

export type { ErrorDiffusionOptions, DistributeErrorOptions };
