/**
 * QR Generator Filter Preprocessing
 * QR-specific image preprocessing that uses overlay module filters
 */

import { createLogger } from '../../lib/logger';
import { parseColor } from '../core';
import { applyFilters, copyImageData, type ColorMode, type FilterOptions } from '../overlay';
import { applyCannyEdge, applySobelEdge } from './filters-edge';
import type { QRGeneratorConfig } from './types';

const log = createLogger('GENERATE');

/**
 * Preprocess image data with configured filters
 * Uses overlay module's applyFilters (canonical source) with QR config mapping
 */
export function preprocessImageData(
  imageData: ImageData,
  config: QRGeneratorConfig,
  debug = false
): ImageData {
  // Map QR config to FilterOptions
  const filterOptions: FilterOptions = {};

  // NOTE: UI/store values for overlay preprocessing use overlay module ranges.
  // We keep QRGeneratorConfig.filter* in those same ranges to avoid double scaling.
  // - brightness: -100..100
  // - contrast:   -100..100 (overlay supports broader range, but -100..100 is fine)
  // - saturation: -100..100 (overlay expects 0..200, where 100 is neutral)
  // - hue:        0..360 degrees
  // - blur:       px radius (0..)
  // - sharpen:    0..100
  // - posterize:  0..16 levels
  // - threshold:  0..255, where 0 means disabled

  if (config.filterBrightness !== undefined && config.filterBrightness !== 0) {
    filterOptions.brightness = config.filterBrightness;
  }

  if (config.filterContrast !== undefined && config.filterContrast !== 0) {
    // overlay contrast function accepts a broader range, but the UI uses -100..100.
    filterOptions.contrast = config.filterContrast;
  }

  if (config.filterSaturation !== undefined && config.filterSaturation !== 0) {
    filterOptions.saturation = config.filterSaturation + 100;
  }

  if (config.filterHue !== undefined && config.filterHue !== 0) {
    filterOptions.hue = config.filterHue;
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

  // Threshold: 0..255, where 0 means disabled
  if (config.filterThreshold !== undefined && config.filterThreshold > 0) {
    filterOptions.threshold = config.filterThreshold;
  }

  if (config.filterBlur !== undefined && config.filterBlur > 0) {
    filterOptions.blur = config.filterBlur;
  }

  if (config.filterSharpen !== undefined && config.filterSharpen > 0) {
    filterOptions.sharpen = config.filterSharpen;
  }

  if (config.filterPosterize !== undefined && config.filterPosterize > 0) {
    filterOptions.posterize = config.filterPosterize;
  }

  if (config.filterDuotone1 && config.filterDuotone2) {
    // Parse hex color strings into RGB objects for duotone filter
    const lightRgb = parseColor(config.filterDuotone1);
    const darkRgb = parseColor(config.filterDuotone2);
    filterOptions.duotone = { light: lightRgb, dark: darkRgb };
  }

  // CRITICAL: Map colorMode to filterOptions.colorMode
  // This was previously missing, causing center logos to appear grayscale even with colorMode='color'
  // The applyFilters function supports colorMode at the end of its processing chain
  if (config.colorMode) {
    if (config.colorMode === 'color') {
      // When colorMode is 'color', ensure we DON'T apply grayscale filter
      // This fixes the issue where center logos appeared grayscale even with colorMode='color'
      filterOptions.grayscale = false;
      // Don't set filterOptions.colorMode - applyColorMode returns early for 'color' anyway
    } else {
      // For 'grayscale' or 'bw', set the colorMode and disable separate grayscale filter
      // to avoid double-processing (colorMode handles conversion internally)
      filterOptions.colorMode = config.colorMode as ColorMode;
      filterOptions.grayscale = false;
    }
  }

  // Debug logging for preprocessing decisions
  if (debug) {
    log.debug('preprocessImageData - filter options', {
      brightness: filterOptions.brightness,
      contrast: filterOptions.contrast,
      saturation: filterOptions.saturation,
      hue: filterOptions.hue,
      gamma: filterOptions.gamma,
      invert: filterOptions.invert,
      grayscale: filterOptions.grayscale,
      threshold: filterOptions.threshold,
      blur: filterOptions.blur,
      sharpen: filterOptions.sharpen,
      posterize: filterOptions.posterize,
      colorMode: filterOptions.colorMode,
      hasDuotone: !!filterOptions.duotone,
      configColorMode: config.colorMode,
    });
  }

  // If no filters to apply, return copy of original
  if (Object.keys(filterOptions).length === 0) {
    if (debug) {
      log.debug('preprocessImageData - no filters to apply, returning copy');
    }
    return copyImageData(imageData);
  }

  // Apply basic color filters first.
  if (debug) {
    log.debug('preprocessImageData - applying filters');
  }
  let out = applyFilters(imageData, filterOptions);

  // Optional edge-detect post-pass.
  if (config.filterEdgeDetect) {
    const mode = (config.filterEdgeMode || 'sobel').toLowerCase();
    if (debug) {
      log.debug('preprocessImageData - applying edge detection', { mode });
    }
    out = mode === 'canny' ? applyCannyEdge(out) : applySobelEdge(out);
  }

  if (debug) {
    log.debug('preprocessImageData - complete');
  }
  return out;
}
