import type { RGB } from './overlay-color-types';
import type { ColorMode } from './overlay-filters.types';

export interface FilterOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  gamma?: number;
  invert?: boolean;
  grayscale?: boolean;
  threshold?: number;
  posterize?: number;
  sharpen?: number;
  blur?: number;
  duotone?: { light: RGB; dark: RGB };
  colorMode?: ColorMode;
}
