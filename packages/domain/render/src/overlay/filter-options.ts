import type { RGB } from "./rgb";
import type { ColorMode } from "./color-mode";

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
