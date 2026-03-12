import type { FilterOptions } from './overlay-filters.types';
import { brightness } from './brightness';
import { contrast } from './contrast';
import { saturation } from './saturation';
import { hueRotate } from './hue-rotate';
import { gamma } from './gamma';
import { log } from './log';

// ============================================
// MAIN APPLY FUNCTION
// ============================================

export function applyTonalFilters(result: ImageData, options: FilterOptions): ImageData {
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
