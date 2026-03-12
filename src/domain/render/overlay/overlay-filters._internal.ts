import { createLogger } from '../../../infra/logging/logger';
import type { FilterOptions } from './overlay-filters.types';
import { brightness } from './brightness';
import { contrast } from './contrast';
import { saturation } from './saturation';
import { hueRotate } from './hue-rotate';
import { gamma } from './gamma';
import { invert } from './invert';
import { grayscale } from './grayscale';
import { threshold } from './threshold';
import { posterize } from './posterize';
import { sharpen } from './sharpen';
import { blur } from './blur';
import { duotone } from './duotone';
import { applyColorMode } from './apply-color-mode';

export const log = createLogger('OVERLAY');

// ============================================
// MAIN APPLY FUNCTION
// ============================================

function applyTonalFilters(result: ImageData, options: FilterOptions): ImageData {
  let out = result;
  if (options.brightness !== undefined && options.brightness !== 0) {
    log.trace('Applying brightness', { value: options.brightness });
    out = brightness(out, options.brightness);
  }
  if (options.contrast !== undefined && options.contrast !== 0) {
    log.trace('Applying contrast', { value: options.contrast });
    out = contrast(out, options.contrast);
  }
  if (options.saturation !== undefined && options.saturation !== 100) {
    log.trace('Applying saturation', { value: options.saturation });
    out = saturation(out, options.saturation);
  }
  if (options.hue !== undefined && options.hue !== 0) {
    log.trace('Applying hue rotation', { value: options.hue });
    out = hueRotate(out, options.hue);
  }
  if (options.gamma !== undefined && options.gamma !== 1) {
    log.trace('Applying gamma', { value: options.gamma });
    out = gamma(out, options.gamma);
  }
  return out;
}

export function applyPixelEffectFilters(result: ImageData, options: FilterOptions): ImageData {
  let out = result;
  if (options.invert) {
    log.trace('Applying INVERT - this will flip perceived brightness');
    out = invert(out);
  }
  if (options.grayscale) {
    log.trace('Applying grayscale');
    out = grayscale(out);
  }
  if (options.threshold !== undefined) {
    log.trace('Applying threshold', { value: options.threshold });
    out = threshold(out, options.threshold);
  }
  if (options.posterize !== undefined && options.posterize > 0) {
    log.trace('Applying posterize', { value: options.posterize });
    out = posterize(out, options.posterize);
  }
  if (options.sharpen !== undefined && options.sharpen > 0) {
    log.trace('Applying sharpen', { value: options.sharpen });
    out = sharpen(out, options.sharpen);
  }
  if (options.blur !== undefined && options.blur > 0) {
    log.trace('Applying blur', { value: options.blur });
    out = blur(out, options.blur);
  }
  if (options.duotone) {
    log.trace('Applying duotone');
    out = duotone(out, options.duotone.light, options.duotone.dark);
  }
  if (options.colorMode) {
    log.trace('Applying colorMode', { mode: options.colorMode });
    out = applyColorMode(out, options.colorMode);
  }
  return out;
}

export { applyTonalFilters };
