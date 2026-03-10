/**
 * QR Generator Filter Preprocessing
 * QR-specific image preprocessing that uses overlay module filters
 * Includes automatic detection and softening of high-contrast B&W images
 */

import { createLogger } from '../../lib/logger';
import { parseColor, rgbToLumaLinear } from '../core';
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

type OverlayToneStats = {
  lumaMean: number;
  lumaStd: number;
  saturationMean: number;
  clippedDarkRatio: number;
  clippedLightRatio: number;
};

function clamp01(v: number): number {
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
}

function clampByte(v: number): number {
  if (v <= 0) return 0;
  if (v >= 255) return 255;
  return Math.round(v);
}

function computeOverlayToneStats(imageData: ImageData): OverlayToneStats {
  const data = imageData.data;
  const totalPixels = data.length / 4;
  if (totalPixels <= 0) {
    return {
      lumaMean: 0.5,
      lumaStd: 0,
      saturationMean: 0,
      clippedDarkRatio: 0,
      clippedLightRatio: 0,
    };
  }

  const targetSamples = 65536;
  const stride = Math.max(1, Math.floor(Math.sqrt(totalPixels / targetSamples)));
  let sampleCount = 0;
  let sumLuma = 0;
  let sumLumaSq = 0;
  let sumSat = 0;
  let clippedDark = 0;
  let clippedLight = 0;

  const pixelStride = stride * 4;
  for (let i = 0; i < data.length; i += pixelStride) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const maxCh = Math.max(r, g, b);
    const minCh = Math.min(r, g, b);
    const sat = maxCh <= 0 ? 0 : (maxCh - minCh) / maxCh;
    const luma = rgbToLumaLinear(r, g, b);
    sumLuma += luma;
    sumLumaSq += luma * luma;
    sumSat += sat;
    if (luma <= 0.08) clippedDark++;
    if (luma >= 0.92) clippedLight++;
    sampleCount++;
  }

  if (sampleCount <= 0) {
    return {
      lumaMean: 0.5,
      lumaStd: 0,
      saturationMean: 0,
      clippedDarkRatio: 0,
      clippedLightRatio: 0,
    };
  }

  const lumaMean = sumLuma / sampleCount;
  const lumaStd = Math.sqrt(Math.max(0, sumLumaSq / sampleCount - lumaMean * lumaMean));

  return {
    lumaMean,
    lumaStd,
    saturationMean: sumSat / sampleCount,
    clippedDarkRatio: clippedDark / sampleCount,
    clippedLightRatio: clippedLight / sampleCount,
  };
}

function applyAdaptiveColorNormalization(
  imageData: ImageData,
  stats: OverlayToneStats,
  strength: number
): ImageData {
  const normalizedStrength = clamp01(strength);
  if (normalizedStrength <= 0.001) return imageData;

  const data = imageData.data;
  const meanLuma = stats.lumaMean;
  const contrastScale = 1 - normalizedStrength * 0.3;
  const satScale = 1 - normalizedStrength * 0.22;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luma = rgbToLumaLinear(r, g, b);
    const gray = (r + g + b) / 3;
    let rAdj = gray + (r - gray) * satScale;
    let gAdj = gray + (g - gray) * satScale;
    let bAdj = gray + (b - gray) * satScale;

    // Compress toward image mean luma to keep frame-to-frame decode stability.
    let targetLuma = meanLuma + (luma - meanLuma) * contrastScale;
    if (targetLuma > 0.5) {
      targetLuma = 0.5 + (targetLuma - 0.5) * (1 - normalizedStrength * 0.18);
    } else {
      targetLuma = 0.5 - (0.5 - targetLuma) * (1 - normalizedStrength * 0.14);
    }

    const adjustedLuma = rgbToLumaLinear(clampByte(rAdj), clampByte(gAdj), clampByte(bAdj));
    const delta = (targetLuma - adjustedLuma) * 255;
    rAdj += delta;
    gAdj += delta;
    bAdj += delta;

    data[i] = clampByte(rAdj);
    data[i + 1] = clampByte(gAdj);
    data[i + 2] = clampByte(bAdj);
  }

  return imageData;
}

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
    const gray = Math.floor(rgbToLumaLinear(data[i], data[i + 1], data[i + 2]) * 255);
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
 * Build FilterOptions from QR generator config.
 *
 * NOTE: UI/store values for overlay preprocessing use overlay module ranges.
 * We keep QRGeneratorConfig.filter* in those same ranges to avoid double scaling.
 * - brightness: -100..100
 * - contrast:   -100..100 (overlay supports broader range, but -100..100 is fine)
 * - saturation: -100..100 (overlay expects 0..200, where 100 is neutral)
 * - hue:        0..360 degrees
 * - blur:       px radius (0..)
 * - sharpen:    0..100
 * - posterize:  0..16 levels
 * - threshold:  0..255, where 0 means disabled
 */
function applyBasicFilterOptions(config: QRGeneratorConfig, filterOptions: FilterOptions): void {
  if (config.filterBrightness !== undefined && config.filterBrightness !== 0)
    filterOptions.brightness = config.filterBrightness;
  if (config.filterContrast !== undefined && config.filterContrast !== 0)
    filterOptions.contrast = config.filterContrast;
  if (config.filterSaturation !== undefined && config.filterSaturation !== 0)
    filterOptions.saturation = config.filterSaturation + 100;
  if (config.filterHue !== undefined && config.filterHue !== 0)
    filterOptions.hue = config.filterHue;
  if (config.filterGamma !== undefined && config.filterGamma !== 1)
    filterOptions.gamma = config.filterGamma;
  if (config.filterInvert) filterOptions.invert = true;
  if (config.filterGrayscale) filterOptions.grayscale = true;
  if (config.filterThreshold !== undefined && config.filterThreshold > 0)
    filterOptions.threshold = config.filterThreshold;
  if (config.filterBlur !== undefined && config.filterBlur > 0)
    filterOptions.blur = config.filterBlur;
  if (config.filterSharpen !== undefined && config.filterSharpen > 0)
    filterOptions.sharpen = config.filterSharpen;
  if (config.filterPosterize !== undefined && config.filterPosterize > 0)
    filterOptions.posterize = config.filterPosterize;
}

function applyDuotoneAndColorMode(config: QRGeneratorConfig, filterOptions: FilterOptions): void {
  if (
    config.overlayMode === 'duotone' &&
    config.filterDuotone1 &&
    config.filterDuotone2 &&
    config.colorMode !== 'color'
  ) {
    const lightRgb = parseColor(config.filterDuotone1);
    const darkRgb = parseColor(config.filterDuotone2);
    if (lightRgb && darkRgb) {
      filterOptions.duotone = { light: lightRgb, dark: darkRgb };
    }
  }

  if (config.colorMode) {
    if (config.colorMode === 'color') {
      filterOptions.grayscale = false;
    } else {
      filterOptions.colorMode = config.colorMode as ColorMode;
      filterOptions.grayscale = false;
    }
  }
}

function buildFilterOptionsFromConfig(config: QRGeneratorConfig): FilterOptions {
  const filterOptions: FilterOptions = {};
  applyBasicFilterOptions(config, filterOptions);
  applyDuotoneAndColorMode(config, filterOptions);
  return filterOptions;
}

function shouldAutoNormalizeColor(config: QRGeneratorConfig): boolean {
  if (config.disableAutoSoften || config.qrFirstMode) return false;
  const scanGateProfile = config.scanGateProfile ?? 'full';
  if (scanGateProfile === 'off' || config.colorMode !== 'color') return false;
  const overlayMode = (config.overlayMode || '').toLowerCase();
  return (
    overlayMode === 'dithered' ||
    overlayMode === 'blue-noise' ||
    overlayMode === 'blue_noise' ||
    overlayMode === 'artwork'
  );
}

function computeNormalizationStrength(stats: OverlayToneStats, overlayIntensity: number): number {
  const clipRisk = clamp01((stats.clippedDarkRatio + stats.clippedLightRatio - 0.12) / 0.28);
  const contrastRisk = clamp01((stats.lumaStd - 0.2) / 0.18);
  const saturationRisk = clamp01((stats.saturationMean - 0.24) / 0.32);
  const intensityRisk = clamp01((overlayIntensity - 0.45) / 0.45);
  return clamp01(
    contrastRisk * 0.38 + saturationRisk * 0.28 + clipRisk * 0.24 + intensityRisk * 0.2
  );
}

function applyAdaptiveNormalizationIfNeeded(
  imageData: ImageData,
  config: QRGeneratorConfig,
  debug: boolean
): ImageData {
  if (!shouldAutoNormalizeColor(config)) return imageData;

  const stats = computeOverlayToneStats(imageData);
  const overlayIntensity = Math.max(0, Math.min(100, config.overlayIntensity ?? 100)) / 100;
  const normalizationStrength = computeNormalizationStrength(stats, overlayIntensity);

  if (normalizationStrength > 0.08) {
    if (debug) {
      log.debug('preprocessImageData - adaptive color normalization', {
        strength: normalizationStrength.toFixed(3),
        lumaStd: stats.lumaStd.toFixed(3),
        saturationMean: stats.saturationMean.toFixed(3),
        clippedDarkRatio: stats.clippedDarkRatio.toFixed(3),
        clippedLightRatio: stats.clippedLightRatio.toFixed(3),
        overlayIntensity: (overlayIntensity * 100).toFixed(1),
      });
    }
    return applyAdaptiveColorNormalization(imageData, stats, normalizationStrength);
  }

  if (debug) {
    log.debug('preprocessImageData - adaptive normalization skipped (low risk)', {
      lumaStd: stats.lumaStd.toFixed(3),
      saturationMean: stats.saturationMean.toFixed(3),
      clippedDarkRatio: stats.clippedDarkRatio.toFixed(3),
      clippedLightRatio: stats.clippedLightRatio.toFixed(3),
    });
  }
  return imageData;
}

/**
 * Preprocess image data with configured filters
 * Uses overlay module's applyFilters (canonical source) with QR config mapping
 */
function autoSoftenIfNeeded(data: ImageData, config: QRGeneratorConfig, debug: boolean): ImageData {
  if (config.disableAutoSoften || config.qrFirstMode) return data;
  if (!detectBimodalBW(data)) return data;
  if (debug) {
    log.debug('preprocessImageData - detected high-contrast B&W, applying softening');
  }
  return softenBWImage(data);
}

export function preprocessImageData(
  imageData: ImageData,
  config: QRGeneratorConfig,
  debug = false
): ImageData {
  const filterOptions = buildFilterOptionsFromConfig(config);

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
  // AUTOMATIC B&W SOFTENING
  // =========================================
  // Detect high-contrast B&W images (spirals, concentric circles, etc.)
  // and soften them with blur + gamma to create gradients that error
  // diffusion and blue-noise dithering can work with effectively.
  // Without softening, raw 0/255 pixels produce poor dithering results.

  let workingData = copyImageData(imageData);
  workingData = autoSoftenIfNeeded(workingData, config, debug);

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

  out = applyAdaptiveNormalizationIfNeeded(out, config, debug);

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
