/**
 * Image Filters Module
 * Provides all image processing filters for overlay preprocessing
 * Works with Canvas ImageData for real-time processing
 */

// ============================================
// TYPES
// ============================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorMode = 'bw' | 'grayscale' | 'color';

export interface FilterOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  gamma?: number;
  invert?: boolean;
  grayscale?: boolean;
  threshold?: number;
  posterize?: number;
  sharpen?: number;
  blur?: number;
  duotone?: { light: RGB; dark: RGB };
  colorMode?: ColorMode;
}

// ============================================
// UTILITY FUNCTIONS - Imported from core
// ============================================

import {
  rgbToGray as coreRgbToGray,
  hslToRgb as coreHslToRgb,
  rgbToHsl as coreRgbToHsl,
  clamp as coreClamp,
  clamp01 as coreClamp01,
} from '../../core';

// Re-export with same signatures for backwards compatibility
export function clamp(value: number, min: number, max: number): number {
  if (min === 0 && max === 255) return coreClamp(value);
  if (min === 0 && max === 1) return coreClamp01(value);
  return Math.max(min, Math.min(max, value));
}

export function clamp01(value: number): number {
  return coreClamp01(value);
}

// Normalize 0-255 to 0-1 for core function, then scale result
export function rgbToGray(r: number, g: number, b: number): number {
  return coreRgbToGray(r, g, b);
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  return coreHslToRgb(h, s, l);
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  return coreRgbToHsl(r, g, b);
}

export function copyImageData(imageData: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
}

// ============================================
// BASIC FILTERS
// ============================================

export function brightness(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = amount / 100;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + 255 * factor, 0, 255);
    data[i + 1] = clamp(data[i + 1] + 255 * factor, 0, 255);
    data[i + 2] = clamp(data[i + 2] + 255 * factor, 0, 255);
  }

  return imageData;
}

export function contrast(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128, 0, 255);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128, 0, 255);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128, 0, 255);
  }

  return imageData;
}

export function saturation(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = amount / 100;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
    data[i] = clamp(gray + factor * (data[i] - gray), 0, 255);
    data[i + 1] = clamp(gray + factor * (data[i + 1] - gray), 0, 255);
    data[i + 2] = clamp(gray + factor * (data[i + 2] - gray), 0, 255);
  }

  return imageData;
}

export function hueRotate(imageData: ImageData, degrees: number): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) hsl.h += 360;
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    data[i] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }

  return imageData;
}

export function gamma(imageData: ImageData, value: number): ImageData {
  const data = imageData.data;
  const invGamma = 1 / value;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(255 * Math.pow(data[i] / 255, invGamma));
    data[i + 1] = Math.round(255 * Math.pow(data[i + 1] / 255, invGamma));
    data[i + 2] = Math.round(255 * Math.pow(data[i + 2] / 255, invGamma));
  }

  return imageData;
}

export function invert(imageData: ImageData): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  return imageData;
}

export function grayscale(imageData: ImageData): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(rgbToGray(data[i], data[i + 1], data[i + 2]));
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  return imageData;
}

export function threshold(imageData: ImageData, level: number): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
    const value = gray > level ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  return imageData;
}

export function posterize(imageData: ImageData, levels: number): ImageData {
  const data = imageData.data;
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }

  return imageData;
}

export function duotone(
  imageData: ImageData,
  lightColor: RGB,
  darkColor: RGB
): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]) / 255;
    data[i] = Math.round(darkColor.r * (1 - gray) + lightColor.r * gray);
    data[i + 1] = Math.round(darkColor.g * (1 - gray) + lightColor.g * gray);
    data[i + 2] = Math.round(darkColor.b * (1 - gray) + lightColor.b * gray);
  }

  return imageData;
}

// ============================================
// CONVOLUTION FILTERS
// ============================================

export function convolve(
  imageData: ImageData,
  kernel: number[][],
  divisor?: number
): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new Uint8ClampedArray(data);

  const kSize = kernel.length;
  const kHalf = Math.floor(kSize / 2);
  const div = divisor ?? (kernel.flat().reduce((a, b) => a + b, 0) || 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = clamp(x + kx - kHalf, 0, width - 1);
          const py = clamp(y + ky - kHalf, 0, height - 1);
          const idx = (py * width + px) * 4;
          const weight = kernel[ky][kx];

          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }

      const idx = (y * width + x) * 4;
      result[idx] = clamp(r / div, 0, 255);
      result[idx + 1] = clamp(g / div, 0, 255);
      result[idx + 2] = clamp(b / div, 0, 255);
    }
  }

  imageData.data.set(result);
  return imageData;
}

export function sharpen(imageData: ImageData, amount: number = 1): ImageData {
  const kernel = [
    [0, -amount, 0],
    [-amount, 1 + 4 * amount, -amount],
    [0, -amount, 0],
  ];
  return convolve(imageData, kernel, 1);
}

export function blur(imageData: ImageData, radius: number = 1): ImageData {
  const size = 2 * radius + 1;
  const kernel = Array(size).fill(null).map(() => Array(size).fill(1));
  return convolve(imageData, kernel);
}

export function gaussianBlur(
  imageData: ImageData,
  radius: number = 1
): ImageData {
  // Simple 3x3 Gaussian
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];
  let result = imageData;
  for (let i = 0; i < radius; i++) {
    result = convolve(result, kernel);
  }
  return result;
}

export function emboss(imageData: ImageData): ImageData {
  const kernel = [
    [-2, -1, 0],
    [-1, 1, 1],
    [0, 1, 2],
  ];
  return convolve(imageData, kernel, 1);
}

// ============================================
// EDGE DETECTION
// ============================================

export function sobelEdge(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new Uint8ClampedArray(data.length);

  const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = rgbToGray(data[idx], data[idx + 1], data[idx + 2]);
          gx += gray * sobelX[ky + 1][kx + 1];
          gy += gray * sobelY[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      const idx = (y * width + x) * 4;
      result[idx] = magnitude;
      result[idx + 1] = magnitude;
      result[idx + 2] = magnitude;
      result[idx + 3] = data[idx + 3];
    }
  }

  imageData.data.set(result);
  return imageData;
}

export function cannyEdge(
  imageData: ImageData,
  lowThreshold: number = 50,
  highThreshold: number = 150
): ImageData {
  // Simplified Canny: just use Sobel + threshold
  const sobelResult = sobelEdge(copyImageData(imageData));
  const data = sobelResult.data;

  for (let i = 0; i < data.length; i += 4) {
    const magnitude = data[i];
    const value = magnitude > highThreshold ? 255 : magnitude > lowThreshold ? 128 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  imageData.data.set(data);
  return imageData;
}

// ============================================
// DATA EXTRACTION
// ============================================

export function getBrightnessMap(imageData: ImageData): Float32Array {
  const data = imageData.data;
  const map = new Float32Array(data.length / 4);

  for (let i = 0; i < data.length; i += 4) {
    map[i / 4] = rgbToGray(data[i], data[i + 1], data[i + 2]) / 255;
  }

  return map;
}

export function getRGBMap(imageData: ImageData): {
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
} {
  const data = imageData.data;
  const size = data.length / 4;
  const r = new Float32Array(size);
  const g = new Float32Array(size);
  const b = new Float32Array(size);

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    r[idx] = data[i] / 255;
    g[idx] = data[i + 1] / 255;
    b[idx] = data[i + 2] / 255;
  }

  return { r, g, b };
}

// ============================================
// COLOR MODE
// ============================================

export function applyColorMode(
  imageData: ImageData,
  mode: ColorMode
): ImageData {
  if (mode === 'color') return imageData;

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(rgbToGray(data[i], data[i + 1], data[i + 2]));

    if (mode === 'bw') {
      const value = gray > 128 ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    } else {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  return imageData;
}

// ============================================
// MAIN APPLY FUNCTION
// ============================================

export function applyFilters(
  imageData: ImageData,
  options: FilterOptions
): ImageData {
  let result = copyImageData(imageData);

  if (options.brightness !== undefined && options.brightness !== 0) {
    result = brightness(result, options.brightness);
  }

  if (options.contrast !== undefined && options.contrast !== 0) {
    result = contrast(result, options.contrast);
  }

  if (options.saturation !== undefined && options.saturation !== 100) {
    result = saturation(result, options.saturation);
  }

  if (options.hue !== undefined && options.hue !== 0) {
    result = hueRotate(result, options.hue);
  }

  if (options.gamma !== undefined && options.gamma !== 1) {
    result = gamma(result, options.gamma);
  }

  if (options.invert) {
    result = invert(result);
  }

  if (options.grayscale) {
    result = grayscale(result);
  }

  if (options.threshold !== undefined) {
    result = threshold(result, options.threshold);
  }

  if (options.posterize !== undefined && options.posterize > 0) {
    result = posterize(result, options.posterize);
  }

  if (options.sharpen !== undefined && options.sharpen > 0) {
    result = sharpen(result, options.sharpen);
  }

  if (options.blur !== undefined && options.blur > 0) {
    result = blur(result, options.blur);
  }

  if (options.duotone) {
    result = duotone(result, options.duotone.light, options.duotone.dark);
  }

  if (options.colorMode) {
    result = applyColorMode(result, options.colorMode);
  }

  return result;
}


