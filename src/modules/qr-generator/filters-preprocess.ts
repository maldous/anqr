/**
 * QR Generator Filter Preprocessing
 * QR-specific image preprocessing that uses overlay module filters
 */

import { applyFilters, copyImageData, type FilterOptions } from '../overlay';
import type { QRGeneratorConfig } from './types';

/**
 * Preprocess image data with configured filters
 * Uses overlay module's applyFilters (canonical source) with QR config mapping
 */
export function preprocessImageData(imageData: ImageData, config: QRGeneratorConfig): ImageData {
  // Map QR config to FilterOptions
  const filterOptions: FilterOptions = {};

  // Brightness: QR config uses -1 to 1, overlay uses -100 to 100
  if (config.filterBrightness !== undefined && config.filterBrightness !== 0) {
    filterOptions.brightness = config.filterBrightness * 100;
  }

  // Contrast: QR config uses -1 to 1, overlay uses raw value
  if (config.filterContrast !== undefined && config.filterContrast !== 0) {
    filterOptions.contrast = config.filterContrast * 255;
  }

  // Saturation: QR config uses -1 to 1, overlay uses -100 to 100
  if (config.filterSaturation !== undefined && config.filterSaturation !== 0) {
    filterOptions.saturation = config.filterSaturation * 100 + 100;
  }

  // Gamma: Direct pass-through
  if (config.filterGamma !== undefined && config.filterGamma !== 1) {
    filterOptions.gamma = config.filterGamma;
  }

  // Invert: Direct pass-through
  if (config.filterInvert) {
    filterOptions.invert = true;
  }

  // Grayscale: Direct pass-through
  if (config.filterGrayscale) {
    filterOptions.grayscale = true;
  }

  // Threshold: QR config uses 0-1, overlay uses 0-255
  if (config.filterThreshold !== undefined && config.filterThreshold > 0) {
    filterOptions.threshold = config.filterThreshold * 255;
  }

  // If no filters to apply, return copy of original
  if (Object.keys(filterOptions).length === 0) {
    return copyImageData(imageData);
  }

  return applyFilters(imageData, filterOptions);
}
