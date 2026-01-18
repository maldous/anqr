/**
 * Image Filters Module
 * Re-exports filter functionality from overlay module
 */

import {
  applyFilters,
  brightness,
  contrast,
  saturation,
  hueRotate,
  gamma,
  invert,
  grayscale,
  threshold,
  posterize,
  duotone,
  sharpen,
  blur,
  gaussianBlur,
  emboss,
  sobelEdge,
  cannyEdge,
  convolve,
  rgbToGray,
  hslToRgb,
  rgbToHsl,
  clamp,
  clamp01,
  copyImageData,
  getBrightnessMap,
  getRGBMap,
  applyColorMode,
  ImageFilters,
  type RGB,
  type RGBA,
  type HSL,
  type FilterOptions,
} from './overlay';

// Re-export types
export type { RGB, RGBA, HSL, FilterOptions };

// Re-export functions and namespace
export {
  applyFilters,
  brightness,
  contrast,
  saturation,
  hueRotate,
  gamma,
  invert,
  grayscale,
  threshold,
  posterize,
  duotone,
  sharpen,
  blur,
  gaussianBlur,
  emboss,
  sobelEdge,
  cannyEdge,
  convolve,
  rgbToGray,
  hslToRgb,
  rgbToHsl,
  clamp,
  clamp01,
  copyImageData,
  getBrightnessMap,
  getRGBMap,
  applyColorMode,
  ImageFilters,
};

export default ImageFilters;
