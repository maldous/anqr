import { grayscale } from './grayscale';
import { brightness } from './brightness';
import { contrast } from './contrast';
import { saturation } from './saturation';
import { gamma } from './gamma';
import { invert } from './invert';
import { threshold } from './threshold';
import { posterize } from './posterize';
import { sharpen } from './sharpen';
import { blur } from './blur';
import { duotone } from './duotone';

// ============================================
// TYPES
// ============================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

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
