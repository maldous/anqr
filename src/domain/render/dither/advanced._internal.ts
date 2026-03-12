import type { ColorMode, DiffusionKernel, RGB } from '../../../modules/dither-algorithms/types';
import { clamp01, rgbToGray } from '../../../modules/dither-algorithms/utils';

export interface BlueNoisePixelResult {
  isDark: boolean;
  color: RGB;
}

export function quantizeBlueNoisePixel(
  r: number,
  g: number,
  b: number,
  threshold: number,
  strengthFactor: number,
  colorMode: ColorMode,
  levels: number
): BlueNoisePixelResult {
  if (colorMode === 'bw') {
    const gray = rgbToGray(r, g, b);
    const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
    const isDark = gray < adjustedThreshold;
    return { isDark, color: isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 } };
  } else if (colorMode === 'grayscale') {
    const gray = rgbToGray(r, g, b);
    const scaled = gray * (levels - 1);
    const low = Math.floor(scaled);
    const high = Math.min(low + 1, levels - 1);
    const frac = scaled - low;
    const t = 0.5 + (threshold - 0.5) * strengthFactor;
    const newVal = (frac > t ? high : low) / (levels - 1);
    const grayByte = Math.round(newVal * 255);
    return { isDark: newVal < 0.5, color: { r: grayByte, g: grayByte, b: grayByte } };
  }
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
  return {
    isDark: brightness < 0.5,
    color: { r: Math.round(newR * 255), g: Math.round(newG * 255), b: Math.round(newB * 255) },
  };
}

export interface DiffusionPixelResult {
  isDark: boolean;
  color: RGB;
  errorR: number;
  errorG: number;
  errorB: number;
}

export function quantizeBNEDPixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number,
  thresholdMod: number
): DiffusionPixelResult {
  if (colorMode === 'bw') {
    const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
    const threshold = 0.5 + thresholdMod;
    const newVal = gray > threshold ? 1 : 0;
    const error = (gray - newVal) * strengthFactor;
    return {
      isDark: newVal === 0,
      color: { r: newVal * 255, g: newVal * 255, b: newVal * 255 },
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

export function quantizePerceptualPixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number,
  toSRGB: (v: number) => number
): DiffusionPixelResult {
  if (colorMode === 'bw') {
    const gray = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
    const newVal = gray > 0.5 ? 1 : 0;
    const error = (gray - newVal) * strengthFactor;
    const outVal = Math.round(toSRGB(newVal) * 255);
    return {
      isDark: newVal === 0,
      color: { r: outVal, g: outVal, b: outVal },
      errorR: error,
      errorG: error,
      errorB: error,
    };
  }
  const newR = Math.round(pixel.r / step) * step;
  const newG = Math.round(pixel.g / step) * step;
  const newB = Math.round(pixel.b / step) * step;
  return {
    isDark: newR * 0.2126 + newG * 0.7152 + newB * 0.0722 < 0.5,
    color: {
      r: Math.round(clamp01(toSRGB(newR)) * 255),
      g: Math.round(clamp01(toSRGB(newG)) * 255),
      b: Math.round(clamp01(toSRGB(newB)) * 255),
    },
    errorR: (pixel.r - newR) * strengthFactor,
    errorG: (pixel.g - newG) * strengthFactor,
    errorB: (pixel.b - newB) * strengthFactor,
  };
}

export function computeSobelEdgeMap(imageData: Float32Array[], width: number, height: number): number[][] {
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
  return edgeMap;
}

export function quantizeEdgeAwarePixel(
  pixel: { r: number; g: number; b: number },
  colorMode: ColorMode,
  step: number,
  strengthFactor: number,
  edgeFactor: number
): DiffusionPixelResult {
  if (colorMode === 'bw') {
    const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
    const newVal = gray > 0.5 ? 1 : 0;
    const error = (gray - newVal) * strengthFactor * edgeFactor;
    return {
      isDark: newVal === 0,
      color: { r: newVal * 255, g: newVal * 255, b: newVal * 255 },
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
    errorR: (pixel.r - newR) * strengthFactor * edgeFactor,
    errorG: (pixel.g - newG) * strengthFactor * edgeFactor,
    errorB: (pixel.b - newB) * strengthFactor * edgeFactor,
  };
}

/** Options for blue noise dithering */
interface BlueNoiseOptions {
  tileSize?: number;
  seed?: number;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
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

export function copyImageToPixels(
  imageData: Float32Array[],
  width: number,
  height: number,
  transform?: (r: number, g: number, b: number) => { r: number; g: number; b: number }
): { r: number; g: number; b: number }[][] {
  const pixels: { r: number; g: number; b: number }[][] = [];
  for (let y = 0; y < height; y++) {
    const row: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      row.push(transform ? transform(r, g, b) : { r, g, b });
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

/** Options for screened blue noise dithering */
interface ScreenedBlueNoiseOptions {
  tileSize?: number;
  seed?: number;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

/** Options for perceptual dithering */
interface PerceptualDitherOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

/** Options for edge-aware dithering */
interface EdgeAwareDitherOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}

export type { BlueNoiseOptions, BlueNoiseErrorDiffusionOptions, ScreenedBlueNoiseOptions, PerceptualDitherOptions, EdgeAwareDitherOptions };
