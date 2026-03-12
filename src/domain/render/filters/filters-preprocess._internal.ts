import { createLogger } from '../../../infra/logging/logger';
import { parseColor, rgbToLumaLinear } from '../color/color';
import {
  applyFilters,
  type ColorMode,
  type FilterOptions,
  gamma,
} from '../../../modules/overlay/index';
import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';
import { detectBimodalBW } from './detect-bimodal-bw';
import { softenBWImage } from './soften-bw-image';

export const log = createLogger('GENERATE');

export type OverlayToneStats = {
  lumaMean: number;
  lumaStd: number;
  saturationMean: number;
  clippedDarkRatio: number;
  clippedLightRatio: number;
};

export function clamp01(v: number): number {
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
}

export function clampByte(v: number): number {
  if (v <= 0) return 0;
  if (v >= 255) return 255;
  return Math.round(v);
}

export function computeOverlayToneStats(imageData: ImageData): OverlayToneStats {
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

export function applyAdaptiveColorNormalization(
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
function applyColorAdjustmentFilters(
  config: QRGeneratorConfig,
  filterOptions: FilterOptions
): void {
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
}

export function applyEffectFilters(config: QRGeneratorConfig, filterOptions: FilterOptions): void {
  if (config.filterThreshold !== undefined && config.filterThreshold > 0)
    filterOptions.threshold = config.filterThreshold;
  if (config.filterBlur !== undefined && config.filterBlur > 0)
    filterOptions.blur = config.filterBlur;
  if (config.filterSharpen !== undefined && config.filterSharpen > 0)
    filterOptions.sharpen = config.filterSharpen;
  if (config.filterPosterize !== undefined && config.filterPosterize > 0)
    filterOptions.posterize = config.filterPosterize;
}

export function applyBasicFilterOptions(config: QRGeneratorConfig, filterOptions: FilterOptions): void {
  applyColorAdjustmentFilters(config, filterOptions);
  applyEffectFilters(config, filterOptions);
}

export function applyDuotoneAndColorMode(config: QRGeneratorConfig, filterOptions: FilterOptions): void {
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

export function buildFilterOptionsFromConfig(config: QRGeneratorConfig): FilterOptions {
  const filterOptions: FilterOptions = {};
  applyBasicFilterOptions(config, filterOptions);
  applyDuotoneAndColorMode(config, filterOptions);
  return filterOptions;
}

export function shouldAutoNormalizeColor(config: QRGeneratorConfig): boolean {
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

export function computeNormalizationStrength(stats: OverlayToneStats, overlayIntensity: number): number {
  const clipRisk = clamp01((stats.clippedDarkRatio + stats.clippedLightRatio - 0.12) / 0.28);
  const contrastRisk = clamp01((stats.lumaStd - 0.2) / 0.18);
  const saturationRisk = clamp01((stats.saturationMean - 0.24) / 0.32);
  const intensityRisk = clamp01((overlayIntensity - 0.45) / 0.45);
  return clamp01(
    contrastRisk * 0.38 + saturationRisk * 0.28 + clipRisk * 0.24 + intensityRisk * 0.2
  );
}

export function applyAdaptiveNormalizationIfNeeded(
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

export { applyColorAdjustmentFilters, autoSoftenIfNeeded };
export type { ColorMode, FilterOptions };
