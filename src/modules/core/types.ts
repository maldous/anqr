/**
 * Core Types
 * Shared type definitions for color and math utilities
 */

/** RGB color with values 0-255 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** RGBA color with values 0-255 and alpha 0-1 */
export interface RGBA extends RGB {
  a: number;
}

/** HSL color with h: 0-360, s: 0-100, l: 0-100 */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/** HSLA color with alpha 0-1 */
export interface HSLA extends HSL {
  a: number;
}

/** Gradient stop definition (with pos for gradient module compatibility) */
export interface GradientStop {
  pos: number;
  color: string;
}

/** Gradient type options */
export type GradientType = 'none' | 'linear' | 'radial' | 'conic';

/** Gradient configuration */
export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}
