// ============================================
// TYPES
// ============================================

import type { RGB, RGBA, HSL } from './overlay-color-types';
export type { RGB, RGBA, HSL } from './overlay-color-types';

export type ColorMode = 'bw' | 'grayscale' | 'color';

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
