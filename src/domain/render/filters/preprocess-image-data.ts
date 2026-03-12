import { applyFilters, copyImageData, gamma } from '../../../modules/overlay/index';
import { applyCannyEdge, applySobelEdge } from './filters-edge';
import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';
import { buildFilterOptionsFromConfig, log, autoSoftenIfNeeded, applyAdaptiveNormalizationIfNeeded } from './filters-preprocess._internal';

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
