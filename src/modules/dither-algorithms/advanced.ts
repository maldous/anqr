/**
 * Advanced Dithering Algorithms
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DITHER');

import { generateBlueNoiseTile, sampleBlueNoise } from './blue-noise';
import { distributeErrorWithKernel } from './error-diffusion';
import { DIFFUSION_KERNELS } from './kernels';
import type { ColorMode, DiffusionKernel, DitherResult, RGB } from './types';
import { clamp01, rgbToGray } from './utils';

/** Options for blue noise dithering */
interface BlueNoiseOptions {
  tileSize?: number;
  seed?: number;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

/** Apply blue noise threshold dithering */
export function blueNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: BlueNoiseOptions = {}
): DitherResult {
  const tileSize = options.tileSize ?? 64;
  const seed = options.seed ?? 0;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const tile = generateBlueNoiseTile(tileSize, seed);
  const strengthFactor = strength / 100;

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < width; x++) {
      const threshold = sampleBlueNoise(x, y, tile, tileSize);
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];

      if (colorMode === 'bw') {
        const gray = rgbToGray(r, g, b);
        const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
        const isDark = gray < adjustedThreshold;

        matrixRow.push(isDark);
        colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
      } else if (colorMode === 'grayscale') {
        const gray = rgbToGray(r, g, b);
        const scaled = gray * (levels - 1);
        const low = Math.floor(scaled);
        const high = Math.min(low + 1, levels - 1);
        const frac = scaled - low;
        const t = 0.5 + (threshold - 0.5) * strengthFactor;
        const newVal = (frac > t ? high : low) / (levels - 1);

        matrixRow.push(newVal < 0.5);
        const grayByte = Math.round(newVal * 255);
        colorRow.push({ r: grayByte, g: grayByte, b: grayByte });
      } else {
        // Color mode
        const quantize = (val: number, noiseOffset: number): number => {
          const t = (threshold + noiseOffset) % 1;
          const adjustedT = 0.5 + (t - 0.5) * strengthFactor;
          const scaled = val * (levels - 1);
          const low = Math.floor(scaled);
          const high = Math.min(low + 1, levels - 1);
          const frac = scaled - low;
          return (frac > adjustedT ? high : low) / (levels - 1);
        };

        const newR = quantize(r, 0);
        const newG = quantize(g, 0.33);
        const newB = quantize(b, 0.67);
        const brightness = rgbToGray(newR, newG, newB);

        matrixRow.push(brightness < 0.5);
        colorRow.push({
          r: Math.round(newR * 255),
          g: Math.round(newG * 255),
          b: Math.round(newB * 255),
        });
      }
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}

/** Options for blue noise error diffusion */
interface BlueNoiseErrorDiffusionOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
  tileSize?: number;
  seed?: number;
}

/** Blue noise modulated error diffusion */
export function blueNoiseErrorDiffusion(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: BlueNoiseErrorDiffusionOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const tileSize = options.tileSize ?? 64;
  const seed = options.seed ?? 0;
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);
  const tile = generateBlueNoiseTile(tileSize, seed);

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

  for (let y = 0; y < height; y++) {
    resultMatrix.push(new Array(width).fill(false));
    resultColors.push(new Array(width).fill({ r: 255, g: 255, b: 255 }));
  }

  for (let y = 0; y < height; y++) {
    const leftToRight = serpentine ? y % 2 === 0 : true;
    const startX = leftToRight ? 0 : width - 1;
    const endX = leftToRight ? width : -1;
    const deltaX = leftToRight ? 1 : -1;

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const pixel = pixels[y][x];
      const blueNoiseVal = sampleBlueNoise(x, y, tile, tileSize);
      const thresholdMod = (blueNoiseVal - 0.5) * 0.3 * strengthFactor;

      if (colorMode === 'bw') {
        const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
        const threshold = 0.5 + thresholdMod;
        const newVal = gray > threshold ? 1 : 0;
        const error = (gray - newVal) * strengthFactor;

        resultMatrix[y][x] = newVal === 0;
        resultColors[y][x] = { r: newVal * 255, g: newVal * 255, b: newVal * 255 };
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

/** Options for screened blue noise dithering */
interface ScreenedBlueNoiseOptions {
  tileSize?: number;
  seed?: number;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

/** Screened blue noise - combines halftone screening with blue noise */
export function screenedBlueNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: ScreenedBlueNoiseOptions = {}
): DitherResult {
  const tileSize = options.tileSize ?? 64;
  const seed = options.seed ?? 0;
  const strength = options.strength ?? 100;
  const tile = generateBlueNoiseTile(tileSize, seed);
  const strengthFactor = strength / 100;

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  const screenSize = 4;
  const screenPattern = [
    [0.1, 0.5, 0.2, 0.6],
    [0.7, 0.3, 0.8, 0.4],
    [0.2, 0.6, 0.1, 0.5],
    [0.8, 0.4, 0.7, 0.3],
  ];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const screenVal = screenPattern[y % screenSize][x % screenSize];
      const blueNoiseVal = sampleBlueNoise(x, y, tile, tileSize);
      const combinedThreshold = screenVal * 0.6 + blueNoiseVal * 0.4;
      const adjustedThreshold = 0.5 + (combinedThreshold - 0.5) * strengthFactor;

      const isDark = gray < adjustedThreshold;
      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}

/** Options for perceptual dithering */
interface PerceptualDitherOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

/** Perceptual dithering - uses perceptual luminance weighting */
export function perceptualDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: PerceptualDitherOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);

  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const toSRGB = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

  const pixels: { r: number; g: number; b: number }[][] = [];
  for (let y = 0; y < height; y++) {
    const row: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      row.push({
        r: toLinear(imageData[y][idx]),
        g: toLinear(imageData[y][idx + 1]),
        b: toLinear(imageData[y][idx + 2]),
      });
    }
    pixels.push(row);
  }

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  for (let y = 0; y < height; y++) {
    resultMatrix.push(new Array(width).fill(false));
    resultColors.push(new Array(width).fill({ r: 255, g: 255, b: 255 }));
  }

  for (let y = 0; y < height; y++) {
    const leftToRight = serpentine ? y % 2 === 0 : true;
    const startX = leftToRight ? 0 : width - 1;
    const endX = leftToRight ? width : -1;
    const deltaX = leftToRight ? 1 : -1;

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const pixel = pixels[y][x];

      if (colorMode === 'bw') {
        const gray = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
        const newVal = gray > 0.5 ? 1 : 0;
        const error = (gray - newVal) * strengthFactor;

        resultMatrix[y][x] = newVal === 0;
        const outVal = Math.round(toSRGB(newVal) * 255);
        resultColors[y][x] = { r: outVal, g: outVal, b: outVal };
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
        const newR = Math.round(pixel.r / step) * step;
        const newG = Math.round(pixel.g / step) * step;
        const newB = Math.round(pixel.b / step) * step;
        const errR = (pixel.r - newR) * strengthFactor;
        const errG = (pixel.g - newG) * strengthFactor;
        const errB = (pixel.b - newB) * strengthFactor;

        const brightness = newR * 0.2126 + newG * 0.7152 + newB * 0.0722;
        resultMatrix[y][x] = brightness < 0.5;
        resultColors[y][x] = {
          r: Math.round(clamp01(toSRGB(newR)) * 255),
          g: Math.round(clamp01(toSRGB(newG)) * 255),
          b: Math.round(clamp01(toSRGB(newB)) * 255),
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

/** Options for edge-aware dithering */
interface EdgeAwareDitherOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

/** Edge-aware dithering - reduces error diffusion across edges */
export function edgeAwareDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: EdgeAwareDitherOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);

  // Compute edge map using Sobel
  const edgeMap: number[][] = [];
  for (let y = 0; y < height; y++) {
    edgeMap.push(new Array(width).fill(0));
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const getGray = (px: number, py: number) => {
        const idx = px * 3;
        return rgbToGray(imageData[py][idx], imageData[py][idx + 1], imageData[py][idx + 2]);
      };

      const gx =
        -getGray(x - 1, y - 1) +
        getGray(x + 1, y - 1) +
        -2 * getGray(x - 1, y) +
        2 * getGray(x + 1, y) +
        -getGray(x - 1, y + 1) +
        getGray(x + 1, y + 1);

      const gy =
        -getGray(x - 1, y - 1) -
        2 * getGray(x, y - 1) -
        getGray(x + 1, y - 1) +
        getGray(x - 1, y + 1) +
        2 * getGray(x, y + 1) +
        getGray(x + 1, y + 1);

      edgeMap[y][x] = Math.min(1, Math.hypot(gx, gy));
    }
  }

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

  for (let y = 0; y < height; y++) {
    resultMatrix.push(new Array(width).fill(false));
    resultColors.push(new Array(width).fill({ r: 255, g: 255, b: 255 }));
  }

  for (let y = 0; y < height; y++) {
    const leftToRight = serpentine ? y % 2 === 0 : true;
    const startX = leftToRight ? 0 : width - 1;
    const endX = leftToRight ? width : -1;
    const deltaX = leftToRight ? 1 : -1;

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const pixel = pixels[y][x];
      const edgeFactor = 1 - edgeMap[y][x] * 0.8;

      if (colorMode === 'bw') {
        const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
        const newVal = gray > 0.5 ? 1 : 0;
        const error = (gray - newVal) * strengthFactor * edgeFactor;

        resultMatrix[y][x] = newVal === 0;
        resultColors[y][x] = { r: newVal * 255, g: newVal * 255, b: newVal * 255 };
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
        const newR = Math.round(pixel.r / step) * step;
        const newG = Math.round(pixel.g / step) * step;
        const newB = Math.round(pixel.b / step) * step;
        const errR = (pixel.r - newR) * strengthFactor * edgeFactor;
        const errG = (pixel.g - newG) * strengthFactor * edgeFactor;
        const errB = (pixel.b - newB) * strengthFactor * edgeFactor;

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

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

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

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const halfBlock = Math.floor(blockSize / 2);
      const x1 = x - halfBlock;
      const y1 = y - halfBlock;
      const x2 = x + halfBlock;
      const y2 = y + halfBlock;
      const area =
        (Math.min(x2, width - 1) - Math.max(x1, 0) + 1) *
        (Math.min(y2, height - 1) - Math.max(y1, 0) + 1);
      const localMean = getSum(x1, y1, x2, y2) / area;

      const threshold = localMean * (1 - 0.2 * strengthFactor);
      const isDark = gray < threshold;

      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
