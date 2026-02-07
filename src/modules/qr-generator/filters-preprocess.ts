/**
 * QR Generator Filter Preprocessing
 * QR-specific image preprocessing that uses overlay module filters
 * Includes automatic detection and softening of high-contrast B&W images
 */

import { createLogger } from '../../lib/logger';
import { parseColor, rgbToGray } from '../core';
import {
  applyFilters,
  type ColorMode,
  copyImageData,
  type FilterOptions,
  gamma,
  gaussianBlur,
} from '../overlay';
import {
  BUCKET_SHIFT,
  DARK_REGION_END,
  HISTOGRAM_BUCKETS,
  LIGHT_REGION_START,
  MAX_VALLEY_RATIO,
  MIN_PEAK_RATIO,
  MIN_PEAK_SEPARATION,
} from './dithering-constants';
import { applyCannyEdge, applySobelEdge } from './filters-edge';
import type { QRGeneratorConfig } from './types';

const log = createLogger('GENERATE');

/**
 * Detect if an image is high-contrast B&W (bimodal histogram).
 * Uses histogram analysis similar to GlobalHistogramBinarizer from QR decoder.
 *
 * A bimodal B&W image has:
 * - A strong peak near 0 (black)
 * - A strong peak near 255 (white)
 * - Very few pixels in the middle (the valley)
 *
 * @param imageData - The image data to analyze
 * @returns true if the image appears to be high-contrast B&W
 */
export function detectBimodalBW(imageData: ImageData): boolean {
  const data = imageData.data;
  const totalPixels = data.length / 4;

  // Build luminance histogram
  const histogram = new Int32Array(HISTOGRAM_BUCKETS);

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
    const bucket = Math.min(HISTOGRAM_BUCKETS - 1, gray >> BUCKET_SHIFT);
    histogram[bucket]++;
  }

  // Find peak in dark region (buckets 0-7)
  let darkPeak = 0;
  let darkPeakBucket = 0;
  for (let i = 0; i < DARK_REGION_END; i++) {
    if (histogram[i] > darkPeak) {
      darkPeak = histogram[i];
      darkPeakBucket = i;
    }
  }

  // Find peak in light region (buckets 24-31)
  let lightPeak = 0;
  let lightPeakBucket = 0;
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    if (histogram[i] > lightPeak) {
      lightPeak = histogram[i];
      lightPeakBucket = i;
    }
  }

  // Check peak separation
  if (lightPeakBucket - darkPeakBucket < MIN_PEAK_SEPARATION) {
    return false;
  }

  // Count pixels in each region
  let darkRegionCount = 0;
  for (let i = 0; i < DARK_REGION_END; i++) {
    darkRegionCount += histogram[i];
  }

  let lightRegionCount = 0;
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    lightRegionCount += histogram[i];
  }

  // Count pixels in the valley (middle region)
  let valleyCount = 0;
  for (let i = DARK_REGION_END; i < LIGHT_REGION_START; i++) {
    valleyCount += histogram[i];
  }

  // Check bimodal criteria
  const darkRatio = darkRegionCount / totalPixels;
  const lightRatio = lightRegionCount / totalPixels;
  const valleyRatio = valleyCount / totalPixels;

  const isBimodal =
    darkRatio >= MIN_PEAK_RATIO && lightRatio >= MIN_PEAK_RATIO && valleyRatio < MAX_VALLEY_RATIO;

  if (isBimodal) {
    log.debug('Detected bimodal B&W image', {
      darkRatio: darkRatio.toFixed(3),
      lightRatio: lightRatio.toFixed(3),
      valleyRatio: valleyRatio.toFixed(3),
      darkPeakBucket,
      lightPeakBucket,
    });
  }

  return isBimodal;
}

/**
 * Soften a high-contrast B&W image to create gradients for better dithering.
 *
 * Applies:
 * 1. Gaussian blur (radius 2) to create soft transitions at hard edges
 * 2. Gamma correction (0.65) to push values toward midtones
 *
 * This transforms harsh B&W patterns into smooth gradients that dithering
 * algorithms can work with effectively.
 *
 * @param imageData - The image data to soften (will be copied, not mutated)
 * @returns Softened image data with gradients
 */
export function softenBWImage(imageData: ImageData): ImageData {
  log.debug('Softening B&W image for better dithering');

  // First copy to avoid mutating original
  let result = copyImageData(imageData);

  // Apply Gaussian blur to create gradients at edges
  // Radius 3 creates wide enough transitions for dithering to work with
  result = gaussianBlur(result, 3);

  // Apply gamma correction to push values toward midtones
  // Gamma < 1 lightens midtones, creating more variation for dithering
  result = gamma(result, 0.65);

  return result;
}

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

  // Only apply duotone if colorMode is NOT 'color' (full color mode should preserve original colors)
  // Duotone converts image to grayscale then maps to two colors, which destroys full color
  if (config.filterDuotone1 && config.filterDuotone2 && config.colorMode !== 'color') {
    // Parse hex color strings into RGB objects for duotone filter
    const lightRgb = parseColor(config.filterDuotone1);
    const darkRgb = parseColor(config.filterDuotone2);
    if (lightRgb && darkRgb) {
      filterOptions.duotone = { light: lightRgb, dark: darkRgb };
    }
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

  // =========================================
  // AUTOMATIC B&W DETECTION (no softening)
  // =========================================
  // Detect high-contrast B&W images like spirals/concentric circles.
  // Previously we softened these images, but that defeats the B&W detection
  // in the dithering code which has a better solution: QR-first mode.
  //
  // Now we just detect and skip softening - the dithering code will detect
  // the B&W image and use QR-first mode which guarantees scannability.

  const workingData = copyImageData(imageData);

  if (!config.disableAutoSoften) {
    if (detectBimodalBW(workingData)) {
      if (debug) {
        log.debug(
          'preprocessImageData - detected high-contrast B&W, skipping softening (QR-first mode will handle)'
        );
      }
      // Don't soften - let the dithering code detect B&W and use QR-first mode
      // Softening would change the histogram and defeat QR-first detection
    }
  }

  // If no additional filters to apply, return the (possibly softened) image
  if (Object.keys(filterOptions).length === 0) {
    if (debug) {
      log.debug('preprocessImageData - no additional filters to apply');
    }
    return workingData;
  }

  // Apply basic color filters.
  if (debug) {
    log.debug('preprocessImageData - applying filters');
  }
  let out = applyFilters(workingData, filterOptions);

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
