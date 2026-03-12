import type { FilterOptions } from './overlay-filters.types';
import { copyImageData } from './copy-image-data';
import { applyPixelEffectFilters } from './apply-pixel-effect-filters';
import { applyTonalFilters } from './apply-tonal-filters';
import { log } from './log';

export function applyFilters(imageData: ImageData, options: FilterOptions): ImageData {
  let result = copyImageData(imageData);

  log.trace('applyFilters called', {
    brightness: options.brightness,
    contrast: options.contrast,
    saturation: options.saturation,
    hue: options.hue,
    gamma: options.gamma,
    invert: options.invert,
    grayscale: options.grayscale,
    threshold: options.threshold,
    posterize: options.posterize,
    sharpen: options.sharpen,
    blur: options.blur,
    colorMode: options.colorMode,
    hasDuotone: !!options.duotone,
  });

  result = applyTonalFilters(result, options);
  result = applyPixelEffectFilters(result, options);

  log.trace('Filter pipeline complete');
  return result;
}
