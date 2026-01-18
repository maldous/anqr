/**
 * Color Utilities Module
 * Provides color parsing, blending, gradients, and contrast checking
 * 
 * This is the canonical source for color types (GradientStop, GradientType)
 * Re-exports core color utilities and adds gradient/advanced functionality
 */

// Re-export core color utilities
export {
  type RGB,
  type RGBA,
  type HSL,
  type HSLA,
  parseHex,
  parseHexAlpha,
  parseRgbString,
  parseHslString,
  parseColor,
  rgbToHex,
  rgbaToHex,
  rgbToString,
  rgbaToString,
  rgbToGray,
  rgbToHsl,
  hslToRgb,
  hslToRgbTuple,
  rgbToHslTuple,
  blendRgb,
  blendColors,
  alphaBlend,
  multiplyBlend,
  screenBlend,
  overlayBlend,
  getContrastRatio,
  isDark,
  getTextColor,
  clamp,
  clamp01,
  createSeededRandom,
} from './core';

import {
  type RGB,
  type RGBA,
  parseColor,
  hslToRgb,
  rgbToHsl,
  getContrastRatio as coreGetContrastRatio,
  createSeededRandom as coreCreateSeededRandom,
} from './core';

/**
 * Calculate relative luminance from RGB values (WCAG 2.0 formula)
 */
export function getRelativeLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Internal helper (same as getRelativeLuminance)
function calcRelativeLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ============================================
// GRADIENT TYPES (canonical source)
// ============================================

export interface GradientStop {
  pos: number;
  color: string;
}

export type GradientType = 'none' | 'linear' | 'radial' | 'conic';

export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}

// ============================================
// SEESED RANDOM (re-export with different name for compatibility)
// ============================================

export const seededRandom = coreCreateSeededRandom;

// ============================================
// CONTRAST UTILITIES
// ============================================

export function meetsContrastAA(fg: string, bg: string): boolean {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  if (!fgRgb || !bgRgb) return false;
  const ratio = coreGetContrastRatio(fgRgb, bgRgb);
  return ratio >= 4.5;
}

export function meetsContrastAAA(fg: string, bg: string): boolean {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  if (!fgRgb || !bgRgb) return false;
  const ratio = coreGetContrastRatio(fgRgb, bgRgb);
  return ratio >= 7;
}

export function adjustForContrast(
  fg: string,
  bg: string,
  minRatio = 4.5
): string {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  if (!fgRgb || !bgRgb) return fg;
  
  const bgLum = calcRelativeLuminance(bgRgb);
  const currentRatio = coreGetContrastRatio(fgRgb, bgRgb);
  
  if (currentRatio >= minRatio) return fg;
  
  // Darken or lighten foreground to meet contrast
  const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgIsDark = bgLum < 0.5;
  
  // Adjust lightness
  let newL = fgHsl.l;
  const step = bgIsDark ? 5 : -5;
  
  for (let i = 0; i < 20; i++) {
    newL = Math.max(0, Math.min(100, newL + step));
    const newRgb = hslToRgb(fgHsl.h, fgHsl.s, newL);
    const newRatio = coreGetContrastRatio(newRgb, bgRgb);
    if (newRatio >= minRatio) {
      return `hsl(${fgHsl.h}, ${fgHsl.s}%, ${newL}%)`;
    }
  }
  
  return fg;
}

// ============================================
// GRADIENT UTILITIES
// ============================================

export function getGradientColor(
  config: GradientConfig,
  position: number
): RGB {
  if (!config.stops || config.stops.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }
  
  if (config.stops.length === 1) {
    return parseColor(config.stops[0].color) || { r: 0, g: 0, b: 0 };
  }
  
  // Sort stops by position
  const sorted = [...config.stops].sort((a, b) => a.pos - b.pos);
  
  // Find surrounding stops
  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (position >= sorted[i].pos && position <= sorted[i + 1].pos) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }
  
  // Interpolate
  const range = upper.pos - lower.pos;
  const t = range > 0 ? (position - lower.pos) / range : 0;
  
  const lowerRgb = parseColor(lower.color) || { r: 0, g: 0, b: 0 };
  const upperRgb = parseColor(upper.color) || { r: 0, g: 0, b: 0 };
  
  return {
    r: Math.round(lowerRgb.r + (upperRgb.r - lowerRgb.r) * t),
    g: Math.round(lowerRgb.g + (upperRgb.g - lowerRgb.g) * t),
    b: Math.round(lowerRgb.b + (upperRgb.b - lowerRgb.b) * t),
  };
}

export function getGradientColorAt(
  stops: GradientStop[],
  position: number
): RGB {
  return getGradientColor({ type: 'linear', stops }, position);
}

export function createCssGradient(config: GradientConfig): string {
  if (config.type === 'none' || !config.stops || config.stops.length === 0) {
    return 'transparent';
  }
  
  const stopsStr = config.stops
    .map(s => `${s.color} ${s.pos * 100}%`)
    .join(', ');
  
  switch (config.type) {
    case 'linear':
      return `linear-gradient(${config.angle ?? 0}deg, ${stopsStr})`;
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`;
    case 'conic':
      return `conic-gradient(from ${config.angle ?? 0}deg, ${stopsStr})`;
    default:
      return 'transparent';
  }
}

// ============================================
// COLOR HARMONY
// ============================================

export function getComplementary(color: string): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const compHue = (hsl.h + 180) % 360;
  const comp = hslToRgb(compHue, hsl.s, hsl.l);
  return `rgb(${comp.r}, ${comp.g}, ${comp.b})`;
}

export function getAnalogous(color: string, angle = 30): [string, string] {
  const rgb = parseColor(color);
  if (!rgb) return [color, color];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const hue1 = (hsl.h + angle + 360) % 360;
  const hue2 = (hsl.h - angle + 360) % 360;
  
  const c1 = hslToRgb(hue1, hsl.s, hsl.l);
  const c2 = hslToRgb(hue2, hsl.s, hsl.l);
  
  return [
    `rgb(${c1.r}, ${c1.g}, ${c1.b})`,
    `rgb(${c2.r}, ${c2.g}, ${c2.b})`,
  ];
}

export function getTriadic(color: string): [string, string] {
  const rgb = parseColor(color);
  if (!rgb) return [color, color];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const hue1 = (hsl.h + 120) % 360;
  const hue2 = (hsl.h + 240) % 360;
  
  const c1 = hslToRgb(hue1, hsl.s, hsl.l);
  const c2 = hslToRgb(hue2, hsl.s, hsl.l);
  
  return [
    `rgb(${c1.r}, ${c1.g}, ${c1.b})`,
    `rgb(${c2.r}, ${c2.g}, ${c2.b})`,
  ];
}

// ============================================
// NAMESPACE EXPORT
// ============================================

export const ColorUtils = {
  parseColor,
  hslToRgb,
  rgbToHsl,
  getContrastRatio: coreGetContrastRatio,
  getRelativeLuminance,
  meetsContrastAA,
  meetsContrastAAA,
  adjustForContrast,
  getGradientColor,
  getGradientColorAt,
  createCssGradient,
  getComplementary,
  getAnalogous,
  getTriadic,
  seededRandom,
};

export default ColorUtils;
