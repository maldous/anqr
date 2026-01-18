/**
 * Core Module
 * Pure utilities with no dependencies - the foundation layer
 * 
 * This module provides:
 * - Color parsing, conversion, and manipulation
 * - Math utilities (clamp, random, interpolation)
 * - Basic types (RGB, RGBA, HSL)
 * - Gradient utilities
 * - Color harmony functions
 * 
 * Rules:
 * - NO dependencies on other modules
 * - NO DOM, canvas, or pixel manipulation
 * - Pure functions only
 */

// Types
export type { RGB, RGBA, HSL, HSLA } from './internal/types';

// Math utilities
export {
  clamp,
  clamp01,
  createSeededRandom,
  createRNG,
  lerp,
} from './internal/math';

// Color utilities
export {
  // Parsing
  parseHex,
  parseHexAlpha,
  parseRgbString,
  parseHslString,
  parseColor,
  // Conversion
  rgbToHex,
  rgbaToHex,
  rgbToString,
  rgbaToString,
  rgbToGray,
  rgbToHsl,
  hslToRgb,
  hslToRgbTuple,
  rgbToHslTuple,
  // Blending
  blendRgb,
  blendColors,
  alphaBlend,
  multiplyBlend,
  screenBlend,
  overlayBlend,
  // Contrast
  getRelativeLuminance,
  getContrastRatio,
  isDark,
  getTextColor,
} from './internal/color';

// Private imports for internal use in this file
import type { RGB as RGBType } from './internal/types';
import {
  parseColor as _parseColor,
  hslToRgb as _hslToRgb,
  rgbToHsl as _rgbToHsl,
  getContrastRatio as _getContrastRatio,
} from './internal/color';
import { createSeededRandom as _createSeededRandom } from './internal/math';

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
// SEEDED RANDOM (alias for compatibility)
// ============================================

export const seededRandom = _createSeededRandom;

// ============================================
// CONTRAST UTILITIES
// ============================================

export function meetsContrastAA(fg: string, bg: string): boolean {
  const fgRgb = _parseColor(fg);
  const bgRgb = _parseColor(bg);
  if (!fgRgb || !bgRgb) return false;
  const ratio = _getContrastRatio(fgRgb, bgRgb);
  return ratio >= 4.5;
}

export function meetsContrastAAA(fg: string, bg: string): boolean {
  const fgRgb = _parseColor(fg);
  const bgRgb = _parseColor(bg);
  if (!fgRgb || !bgRgb) return false;
  const ratio = _getContrastRatio(fgRgb, bgRgb);
  return ratio >= 7;
}

export function adjustForContrast(
  fg: string,
  bg: string,
  minRatio = 4.5
): string {
  const fgRgb = _parseColor(fg);
  const bgRgb = _parseColor(bg);
  if (!fgRgb || !bgRgb) return fg;
  
  const currentRatio = _getContrastRatio(fgRgb, bgRgb);
  if (currentRatio >= minRatio) return fg;
  
  // Darken or lighten foreground to meet contrast
  const fgHsl = _rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgHsl = _rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
  const bgIsDark = bgHsl.l < 50;
  
  // Adjust lightness
  let newL = fgHsl.l;
  const step = bgIsDark ? 5 : -5;
  
  for (let i = 0; i < 20; i++) {
    newL = Math.max(0, Math.min(100, newL + step));
    const newRgb = _hslToRgb(fgHsl.h, fgHsl.s, newL);
    const newRatio = _getContrastRatio(newRgb, bgRgb);
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
): RGBType {
  if (!config.stops || config.stops.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }
  
  if (config.stops.length === 1) {
    return _parseColor(config.stops[0].color) || { r: 0, g: 0, b: 0 };
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
  
  const lowerRgb = _parseColor(lower.color) || { r: 0, g: 0, b: 0 };
  const upperRgb = _parseColor(upper.color) || { r: 0, g: 0, b: 0 };
  
  return {
    r: Math.round(lowerRgb.r + (upperRgb.r - lowerRgb.r) * t),
    g: Math.round(lowerRgb.g + (upperRgb.g - lowerRgb.g) * t),
    b: Math.round(lowerRgb.b + (upperRgb.b - lowerRgb.b) * t),
  };
}

export function getGradientColorAt(
  stops: GradientStop[],
  position: number
): RGBType {
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
  const rgb = _parseColor(color);
  if (!rgb) return color;
  const hsl = _rgbToHsl(rgb.r, rgb.g, rgb.b);
  const compHue = (hsl.h + 180) % 360;
  const comp = _hslToRgb(compHue, hsl.s, hsl.l);
  return `rgb(${comp.r}, ${comp.g}, ${comp.b})`;
}

export function getAnalogous(color: string, angle = 30): [string, string] {
  const rgb = _parseColor(color);
  if (!rgb) return [color, color];
  const hsl = _rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const hue1 = (hsl.h + angle + 360) % 360;
  const hue2 = (hsl.h - angle + 360) % 360;
  
  const c1 = _hslToRgb(hue1, hsl.s, hsl.l);
  const c2 = _hslToRgb(hue2, hsl.s, hsl.l);
  
  return [
    `rgb(${c1.r}, ${c1.g}, ${c1.b})`,
    `rgb(${c2.r}, ${c2.g}, ${c2.b})`,
  ];
}

export function getTriadic(color: string): [string, string] {
  const rgb = _parseColor(color);
  if (!rgb) return [color, color];
  const hsl = _rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const hue1 = (hsl.h + 120) % 360;
  const hue2 = (hsl.h + 240) % 360;
  
  const c1 = _hslToRgb(hue1, hsl.s, hsl.l);
  const c2 = _hslToRgb(hue2, hsl.s, hsl.l);
  
  return [
    `rgb(${c1.r}, ${c1.g}, ${c1.b})`,
    `rgb(${c2.r}, ${c2.g}, ${c2.b})`,
  ];
}


