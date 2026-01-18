/**
 * Image Filters Module
 * @deprecated Import from './overlay' instead
 *
 * Provides all image processing filters for overlay preprocessing
 * Works with Canvas ImageData for real-time processing
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
  type ColorMode,
} from './overlay/internal/filters';

// Re-export everything
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
  type RGB,
  type RGBA,
  type HSL,
  type FilterOptions,
  type ColorMode,
};

export default ImageFilters;
