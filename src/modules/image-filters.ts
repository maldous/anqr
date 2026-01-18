/**
 * Image Filters Module
 * Provides all image processing filters for overlay preprocessing
 * Works with Canvas ImageData for real-time processing
 */

import type { ColorMode } from '../store/qr-store';

// Import types and utilities from core
import type { RGB, RGBA, HSL } from './core';
import {
  clamp as clampFromCore,
  clamp01 as clamp01FromCore,
  rgbToGray as rgbToGrayFromCore,
  rgbToHsl as rgbToHslFromCore,
  hslToRgb as hslToRgbFromCore,
} from './core';

// Re-export types for backward compatibility
export type { RGB, RGBA, HSL };

export interface FilterOptions {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  gamma?: number; // 0.1 to 10
  saturation?: number; // -100 to 100
  hueRotate?: number; // 0 to 360 degrees
  invert?: boolean;
  blur?: number; // radius in pixels
  sharpen?: number; // 0 to 100
  posterize?: number; // 2 to 256 levels
  threshold?: number; // 0 to 255
  edgeDetect?: 'off' | 'sobel' | 'canny';
  colorMode?: ColorMode;
}

// ============================================
// UTILITY FUNCTIONS (re-exported from core)
// ============================================

export const clamp = clampFromCore;
export const clamp01 = clamp01FromCore;
export const rgbToGray = rgbToGrayFromCore;
export const rgbToHsl = rgbToHslFromCore;
export const hslToRgb = hslToRgbFromCore;

// ============================================
// BASIC FILTERS
// ============================================

/** Apply brightness adjustment (-100 to 100) */
export function brightness(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = amount * 2.55; // Convert to 0-255 range

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + factor);
    data[i + 1] = clamp(data[i + 1] + factor);
    data[i + 2] = clamp(data[i + 2] + factor);
  }

  return imageData;
}

/** Apply contrast adjustment (-100 to 100) */
export function contrast(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
  }

  return imageData;
}

/** Apply gamma correction (0.1 to 10) */
export function gamma(imageData: ImageData, value: number): ImageData {
  const data = imageData.data;
  const gammaCorrection = 1 / value;

  // Build lookup table for performance - avoids Math.pow in hot loop
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = clamp(255 * (i / 255) ** gammaCorrection);
  }

  // Apply lookup table to all RGB values
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    data[i] = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
    // Alpha (data[i + 3]) is preserved
  }

  return imageData;
}

/** Apply saturation adjustment (-100 to 100) */
export function saturation(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = (amount + 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
    data[i] = clamp(gray + factor * (data[i] - gray));
    data[i + 1] = clamp(gray + factor * (data[i + 1] - gray));
    data[i + 2] = clamp(gray + factor * (data[i + 2] - gray));
  }

  return imageData;
}

/** Apply hue rotation (0 to 360 degrees) */
export function hueRotate(imageData: ImageData, degrees: number): ImageData {
  const data = imageData.data;
  const angle = (degrees * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Hue rotation matrix coefficients
  const matrix = [
    0.213 + cos * 0.787 - sin * 0.213,
    0.715 - cos * 0.715 - sin * 0.715,
    0.072 - cos * 0.072 + sin * 0.928,
    0.213 - cos * 0.213 + sin * 0.143,
    0.715 + cos * 0.285 + sin * 0.14,
    0.072 - cos * 0.072 - sin * 0.283,
    0.213 - cos * 0.213 - sin * 0.787,
    0.715 - cos * 0.715 + sin * 0.715,
    0.072 + cos * 0.928 + sin * 0.072,
  ];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i] = clamp(r * matrix[0] + g * matrix[1] + b * matrix[2]);
    data[i + 1] = clamp(r * matrix[3] + g * matrix[4] + b * matrix[5]);
    data[i + 2] = clamp(r * matrix[6] + g * matrix[7] + b * matrix[8]);
  }

  return imageData;
}

/** Invert colors */
export function invert(imageData: ImageData): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  return imageData;
}

/** Convert to grayscale */
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

/** Apply threshold (black & white) */
export function threshold(imageData: ImageData, level: number = 128): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
    const val = gray >= level ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  return imageData;
}

/** Posterize (reduce color levels) */
export function posterize(imageData: ImageData, levels: number = 4): ImageData {
  const data = imageData.data;
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }

  return imageData;
}

// ============================================
// CONVOLUTION FILTERS
// ============================================

/** Apply convolution kernel to image */
export function convolve(imageData: ImageData, kernel: number[], divisor?: number): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);

  const kernelSize = Math.sqrt(kernel.length);
  const half = Math.floor(kernelSize / 2);

  if (!divisor) {
    divisor = kernel.reduce((a, b) => a + b, 0) || 1;
  }

  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let r = 0,
        g = 0,
        b = 0;
      let ki = 0;

      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const k = kernel[ki++];

          r += copy[idx] * k;
          g += copy[idx + 1] * k;
          b += copy[idx + 2] * k;
        }
      }

      const outIdx = (y * width + x) * 4;
      data[outIdx] = clamp(r / divisor);
      data[outIdx + 1] = clamp(g / divisor);
      data[outIdx + 2] = clamp(b / divisor);
    }
  }

  return imageData;
}

/** Box blur */
export function blur(imageData: ImageData, radius: number = 1): ImageData {
  const size = radius * 2 + 1;
  const kernel = new Array(size * size).fill(1);
  return convolve(imageData, kernel, size * size);
}

/** Sharpen filter */
export function sharpen(imageData: ImageData, amount: number = 1): ImageData {
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
  return convolve(imageData, kernel, 1);
}

/** Gaussian blur (3x3) */
export function gaussianBlur(imageData: ImageData): ImageData {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  return convolve(imageData, kernel, 16);
}

/** Emboss effect */
export function emboss(imageData: ImageData): ImageData {
  const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
  return convolve(imageData, kernel, 1);
}

// ============================================
// EDGE DETECTION
// ============================================

/** Sobel edge detection */
export function sobelEdge(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Convert to grayscale first
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = rgbToGray(data[idx], data[idx + 1], data[idx + 2]);
  }

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0,
        gy = 0;
      let ki = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const grayIdx = (y + ky) * width + (x + kx);
          gx += gray[grayIdx] * sobelX[ki];
          gy += gray[grayIdx] * sobelY[ki];
          ki++;
        }
      }

      const magnitude = Math.hypot(gx, gy);
      const outIdx = (y * width + x) * 4;
      data[outIdx] = clamp(magnitude);
      data[outIdx + 1] = clamp(magnitude);
      data[outIdx + 2] = clamp(magnitude);
    }
  }

  return imageData;
}

/** Canny-like edge detection (simplified) */
export function cannyEdge(
  imageData: ImageData,
  lowThreshold: number = 50,
  highThreshold: number = 150
): ImageData {
  // First apply Gaussian blur
  gaussianBlur(imageData);

  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Calculate gradients
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = rgbToGray(data[idx], data[idx + 1], data[idx + 2]);
  }

  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  // Sobel gradients
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      const gx =
        -gray[(y - 1) * width + (x - 1)] +
        gray[(y - 1) * width + (x + 1)] -
        2 * gray[y * width + (x - 1)] +
        2 * gray[y * width + (x + 1)] -
        gray[(y + 1) * width + (x - 1)] +
        gray[(y + 1) * width + (x + 1)];

      const gy =
        -gray[(y - 1) * width + (x - 1)] -
        2 * gray[(y - 1) * width + x] -
        gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] +
        2 * gray[(y + 1) * width + x] +
        gray[(y + 1) * width + (x + 1)];

      magnitude[idx] = Math.hypot(gx, gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  // Non-maximum suppression and thresholding
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const outIdx = idx * 4;

      let edge = 0;
      if (magnitude[idx] >= lowThreshold) {
        if (magnitude[idx] >= highThreshold) {
          edge = 255;
        } else {
          // Check if connected to strong edge
          let hasStrong = false;
          for (let dy = -1; dy <= 1 && !hasStrong; dy++) {
            for (let dx = -1; dx <= 1 && !hasStrong; dx++) {
              if (magnitude[(y + dy) * width + (x + dx)] >= highThreshold) {
                hasStrong = true;
              }
            }
          }
          if (hasStrong) edge = 255;
        }
      }

      data[outIdx] = edge;
      data[outIdx + 1] = edge;
      data[outIdx + 2] = edge;
    }
  }

  return imageData;
}

// ============================================
// COLOR MODE CONVERSION
// ============================================

/** Apply color mode conversion */
export function applyColorMode(imageData: ImageData, mode: ColorMode): ImageData {
  if (mode === 'color') return imageData;

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(rgbToGray(data[i], data[i + 1], data[i + 2]));

    if (mode === 'bw') {
      const val = gray > 127 ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    } else {
      // grayscale
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  return imageData;
}

/** Apply duotone effect */
export function duotone(imageData: ImageData, shadowColor: RGB, highlightColor: RGB): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]) / 255;

    data[i] = Math.round(shadowColor.r + (highlightColor.r - shadowColor.r) * gray);
    data[i + 1] = Math.round(shadowColor.g + (highlightColor.g - shadowColor.g) * gray);
    data[i + 2] = Math.round(shadowColor.b + (highlightColor.b - shadowColor.b) * gray);
  }

  return imageData;
}

// ============================================
// COMPOSITE FILTER APPLICATION
// ============================================

/** Apply all filters from options object */
export function applyFilters(imageData: ImageData, options: FilterOptions): ImageData {
  // Apply filters in order
  if (options.colorMode && options.colorMode !== 'color') {
    applyColorMode(imageData, options.colorMode);
  }

  if (options.brightness !== undefined && options.brightness !== 0) {
    brightness(imageData, options.brightness);
  }

  if (options.contrast !== undefined && options.contrast !== 0) {
    contrast(imageData, options.contrast);
  }

  if (options.gamma !== undefined && options.gamma !== 1) {
    gamma(imageData, options.gamma);
  }

  if (options.saturation !== undefined && options.saturation !== 0) {
    saturation(imageData, options.saturation);
  }

  if (options.hueRotate !== undefined && options.hueRotate !== 0) {
    hueRotate(imageData, options.hueRotate);
  }

  if (options.invert) {
    invert(imageData);
  }

  if (options.blur !== undefined && options.blur > 0) {
    blur(imageData, options.blur);
  }

  if (options.sharpen !== undefined && options.sharpen > 0) {
    sharpen(imageData, options.sharpen / 100);
  }

  if (options.posterize !== undefined && options.posterize > 0) {
    posterize(imageData, options.posterize);
  }

  if (options.edgeDetect === 'sobel') {
    sobelEdge(imageData);
  } else if (options.edgeDetect === 'canny') {
    cannyEdge(imageData);
  }

  if (options.threshold !== undefined) {
    threshold(imageData, options.threshold);
  }

  return imageData;
}

/** Create a copy of ImageData */
export function copyImageData(imageData: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

/** Get brightness map (0-1 values) from ImageData */
export function getBrightnessMap(imageData: ImageData): number[][] {
  const { data, width, height } = imageData;
  const map: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
      row.push(gray / 255);
    }
    map.push(row);
  }

  return map;
}

/** Get RGB map from ImageData */
export function getRGBMap(imageData: ImageData): RGB[][] {
  const { data, width, height } = imageData;
  const map: RGB[][] = [];

  for (let y = 0; y < height; y++) {
    const row: RGB[] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      row.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      });
    }
    map.push(row);
  }

  return map;
}

// ============================================
// EXPORT
// ============================================

export const ImageFilters = {
  // Basic
  brightness,
  contrast,
  gamma,
  saturation,
  hueRotate,
  invert,
  grayscale,
  threshold,
  posterize,

  // Convolution
  convolve,
  blur,
  sharpen,
  gaussianBlur,
  emboss,

  // Edge detection
  sobelEdge,
  cannyEdge,

  // Color modes
  applyColorMode,
  duotone,

  // Composite
  applyFilters,
  copyImageData,
  getBrightnessMap,
  getRGBMap,

  // Utilities
  clamp,
  clamp01,
  rgbToGray,
  rgbToHsl,
  hslToRgb,
};

export default ImageFilters;
