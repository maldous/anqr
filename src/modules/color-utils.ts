/**
 * Color Utilities Module
 * Provides color parsing, blending, gradients, and contrast checking
 * 
 * NOTE: Core color utilities have been moved to ./core/internal/color.ts
 * This module re-exports from core and adds QR-specific color utilities
 * that depend on the store (e.g., gradient helpers).
 */

import type { GradientStop, GradientType } from '../store/qr-store';

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

export interface HSLA extends HSL {
  a: number;
}

export interface GradientConfig {
  type: GradientType;
  stops: GradientStop[];
  angle?: number; // For linear gradient (degrees)
  centerX?: number; // For radial/conic (0-1)
  centerY?: number; // For radial/conic (0-1)
}

// ============================================
// COLOR PARSING
// ============================================

/** Parse hex color string to RGB */
export function parseHex(hex: string): RGB {
  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  return {
    r: Number.parseInt(hex.substring(0, 2), 16),
    g: Number.parseInt(hex.substring(2, 4), 16),
    b: Number.parseInt(hex.substring(4, 6), 16),
  };
}

/** Parse hex color string with alpha to RGBA */
export function parseHexAlpha(hex: string): RGBA {
  hex = hex.replace('#', '');

  if (hex.length === 4) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  const rgb = parseHex(hex.substring(0, 6));
  const a = hex.length >= 8 ? Number.parseInt(hex.substring(6, 8), 16) / 255 : 1;

  return { ...rgb, a };
}

/** Parse rgb() or rgba() string */
export function parseRgbString(str: string): RGBA {
  const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
  const match = rgbRegex.exec(str);
  if (match) {
    return {
      r: Number.parseInt(match[1], 10),
      g: Number.parseInt(match[2], 10),
      b: Number.parseInt(match[3], 10),
      a: match[4] === undefined ? 1 : Number.parseFloat(match[4]),
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

/** Parse hsl() or hsla() string */
export function parseHslString(str: string): HSLA {
  const hslRegex = /hsla?\((\d+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\)/;
  const match = hslRegex.exec(str);
  if (match) {
    return {
      h: Number.parseInt(match[1], 10),
      s: Number.parseFloat(match[2]),
      l: Number.parseFloat(match[3]),
      a: match[4] === undefined ? 1 : Number.parseFloat(match[4]),
    };
  }
  return { h: 0, s: 0, l: 0, a: 1 };
}

/** Parse any color string to RGBA */
export function parseColor(color: string): RGBA {
  color = color.trim().toLowerCase();

  if (color.startsWith('#')) {
    return parseHexAlpha(color);
  }

  if (color.startsWith('rgb')) {
    return parseRgbString(color);
  }

  if (color.startsWith('hsl')) {
    const hsl = parseHslString(color);
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return { ...rgb, a: hsl.a };
  }

  // Named colors (basic set)
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    gray: '#808080',
    grey: '#808080',
    transparent: '#00000000',
  };

  if (namedColors[color]) {
    return parseHexAlpha(namedColors[color]);
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

// ============================================
// COLOR CONVERSION
// ============================================

/** Convert RGB to hex string */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Convert RGBA to hex string with alpha */
export function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
}

/** Convert RGB to rgb() string */
export function rgbToString(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/** Convert RGBA to rgba() string */
export function rgbaToString(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

/** Convert RGB to HSL */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/** Convert HSL to RGB */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/** Convert RGB to grayscale (luminance) */
export function rgbToGray(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

// ============================================
// COLOR BLENDING
// ============================================

/** Blend two colors with given ratio (0 = color1, 1 = color2) */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
  const a = c1.a + (c2.a - c1.a) * ratio;

  if (a < 1) {
    return rgbaToString(r, g, b, a);
  }
  return rgbToHex(r, g, b);
}

/** Blend RGB values with ratio */
export function blendRgb(c1: RGB, c2: RGB, ratio: number): RGB {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * ratio),
    g: Math.round(c1.g + (c2.g - c1.g) * ratio),
    b: Math.round(c1.b + (c2.b - c1.b) * ratio),
  };
}

/** Apply alpha over blending (c1 over c2) */
export function alphaBlend(c1: RGBA, c2: RGBA): RGBA {
  const a = c1.a + c2.a * (1 - c1.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };

  return {
    r: Math.round((c1.r * c1.a + c2.r * c2.a * (1 - c1.a)) / a),
    g: Math.round((c1.g * c1.a + c2.g * c2.a * (1 - c1.a)) / a),
    b: Math.round((c1.b * c1.a + c2.b * c2.a * (1 - c1.a)) / a),
    a,
  };
}

/** Multiply blend mode */
export function multiplyBlend(c1: RGB, c2: RGB): RGB {
  return {
    r: Math.round((c1.r * c2.r) / 255),
    g: Math.round((c1.g * c2.g) / 255),
    b: Math.round((c1.b * c2.b) / 255),
  };
}

/** Screen blend mode */
export function screenBlend(c1: RGB, c2: RGB): RGB {
  return {
    r: Math.round(255 - ((255 - c1.r) * (255 - c2.r)) / 255),
    g: Math.round(255 - ((255 - c1.g) * (255 - c2.g)) / 255),
    b: Math.round(255 - ((255 - c1.b) * (255 - c2.b)) / 255),
  };
}

/** Overlay blend mode */
export function overlayBlend(c1: RGB, c2: RGB): RGB {
  const overlay = (a: number, b: number) => {
    if (a < 128) {
      return (2 * a * b) / 255;
    }
    return 255 - (2 * (255 - a) * (255 - b)) / 255;
  };

  return {
    r: Math.round(overlay(c1.r, c2.r)),
    g: Math.round(overlay(c1.g, c2.g)),
    b: Math.round(overlay(c1.b, c2.b)),
  };
}

// ============================================
// GRADIENTS
// ============================================

/** Get color at position in gradient (0-1) */
export function getGradientColor(stops: GradientStop[], position: number): RGB {
  if (stops.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  if (stops.length === 1) {
    return parseColor(stops[0].color);
  }

  // Sort stops by position
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);

  // Find surrounding stops
  let start = sorted[0];
  let end = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (position >= sorted[i].pos && position <= sorted[i + 1].pos) {
      start = sorted[i];
      end = sorted[i + 1];
      break;
    }
  }

  // Handle edge cases
  if (position <= start.pos) {
    return parseColor(start.color);
  }
  if (position >= end.pos) {
    return parseColor(end.color);
  }

  // Interpolate between stops
  const ratio = (position - start.pos) / (end.pos - start.pos);
  const c1 = parseColor(start.color);
  const c2 = parseColor(end.color);

  return blendRgb(c1, c2, ratio);
}

/** Create CSS gradient string */
export function createCssGradient(config: GradientConfig): string {
  if (config.type === 'none' || config.stops.length === 0) {
    return 'none';
  }

  const stopStr = config.stops.map((s) => `${s.color} ${s.pos * 100}%`).join(', ');

  switch (config.type) {
    case 'linear':
      return `linear-gradient(${config.angle || 0}deg, ${stopStr})`;
    case 'radial': {
      const cx = (config.centerX ?? 0.5) * 100;
      const cy = (config.centerY ?? 0.5) * 100;
      return `radial-gradient(circle at ${cx}% ${cy}%, ${stopStr})`;
    }
    case 'conic': {
      const ccx = (config.centerX ?? 0.5) * 100;
      const ccy = (config.centerY ?? 0.5) * 100;
      return `conic-gradient(from ${config.angle || 0}deg at ${ccx}% ${ccy}%, ${stopStr})`;
    }
    default:
      return 'none';
  }
}

/** Apply gradient to a 2D position (for module coloring) */
export function getGradientColorAt(
  config: GradientConfig,
  x: number,
  y: number,
  width: number,
  height: number
): RGB {
  if (config.type === 'none' || config.stops.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  let position: number;

  switch (config.type) {
    case 'linear': {
      const angle = ((config.angle || 0) * Math.PI) / 180;
      const nx = x / width - 0.5;
      const ny = y / height - 0.5;
      position = 0.5 + nx * Math.cos(angle) + ny * Math.sin(angle);
      break;
    }
    case 'radial': {
      const cx = config.centerX ?? 0.5;
      const cy = config.centerY ?? 0.5;
      const dx = x / width - cx;
      const dy = y / height - cy;
      position = Math.hypot(dx, dy) * 2;
      break;
    }
    case 'conic': {
      const cx = config.centerX ?? 0.5;
      const cy = config.centerY ?? 0.5;
      const dx = x / width - cx;
      const dy = y / height - cy;
      const baseAngle = ((config.angle || 0) * Math.PI) / 180;
      const angle = Math.atan2(dy, dx) - baseAngle;
      position = (angle / (2 * Math.PI) + 0.5) % 1;
      break;
    }
    default:
      position = 0;
  }

  return getGradientColor(config.stops, Math.max(0, Math.min(1, position)));
}

// ============================================
// CONTRAST & ACCESSIBILITY
// ============================================

/** Calculate relative luminance for WCAG contrast */
export function getRelativeLuminance(color: RGB | string): number {
  const c = typeof color === 'string' ? parseColor(color) : color;

  const rsRGB = c.r / 255;
  const gsRGB = c.g / 255;
  const bsRGB = c.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Calculate WCAG contrast ratio between two colors */
export function getContrastRatio(color1: RGB | string, color2: RGB | string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/** Check if contrast meets WCAG AA requirement (4.5:1 for normal text) */
export function meetsContrastAA(
  color1: RGB | string,
  color2: RGB | string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/** Check if contrast meets WCAG AAA requirement (7:1 for normal text) */
export function meetsContrastAAA(
  color1: RGB | string,
  color2: RGB | string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/** Adjust color to meet minimum contrast ratio */
export function adjustForContrast(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): string {
  const fg = parseColor(foreground);
  const bg = parseColor(background);

  let currentRatio = getContrastRatio(fg, bg);

  if (currentRatio >= minRatio) {
    return foreground;
  }

  // Determine if we should lighten or darken
  const fgLum = getRelativeLuminance(fg);
  const bgLum = getRelativeLuminance(bg);
  const shouldDarken = fgLum > bgLum;

  // Iteratively adjust
  const adjusted = { ...fg };
  const step = 5;

  while (currentRatio < minRatio && step > 0) {
    if (shouldDarken) {
      adjusted.r = Math.max(0, adjusted.r - step);
      adjusted.g = Math.max(0, adjusted.g - step);
      adjusted.b = Math.max(0, adjusted.b - step);
    } else {
      adjusted.r = Math.min(255, adjusted.r + step);
      adjusted.g = Math.min(255, adjusted.g + step);
      adjusted.b = Math.min(255, adjusted.b + step);
    }

    currentRatio = getContrastRatio(adjusted, bg);

    // Reduce step if we've hit the limits
    if (
      (shouldDarken && adjusted.r === 0 && adjusted.g === 0 && adjusted.b === 0) ||
      (!shouldDarken && adjusted.r === 255 && adjusted.g === 255 && adjusted.b === 255)
    ) {
      break;
    }
  }

  return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
}

/** Check if a color is considered "dark" */
export function isDark(color: RGB | string): boolean {
  const c = typeof color === 'string' ? parseColor(color) : color;
  const gray = rgbToGray(c.r, c.g, c.b);
  return gray < 128;
}

/** Get best text color (black or white) for given background */
export function getTextColor(backgroundColor: string): string {
  const bg = parseColor(backgroundColor);
  const luminance = getRelativeLuminance(bg);
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

// ============================================
// COLOR PALETTE UTILITIES
// ============================================

/** Generate complementary color */
export function getComplementary(color: string): string {
  const rgb = parseColor(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + 180) % 360;
  const result = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(result.r, result.g, result.b);
}

/** Generate analogous colors (30° apart) */
export function getAnalogous(color: string): [string, string] {
  const rgb = parseColor(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hsl1 = { ...hsl, h: (hsl.h + 30) % 360 };
  const hsl2 = { ...hsl, h: (hsl.h - 30 + 360) % 360 };

  const rgb1 = hslToRgb(hsl1.h, hsl1.s, hsl1.l);
  const rgb2 = hslToRgb(hsl2.h, hsl2.s, hsl2.l);

  return [rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgbToHex(rgb2.r, rgb2.g, rgb2.b)];
}

/** Generate triadic colors (120° apart) */
export function getTriadic(color: string): [string, string] {
  const rgb = parseColor(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hsl1 = { ...hsl, h: (hsl.h + 120) % 360 };
  const hsl2 = { ...hsl, h: (hsl.h + 240) % 360 };

  const rgb1 = hslToRgb(hsl1.h, hsl1.s, hsl1.l);
  const rgb2 = hslToRgb(hsl2.h, hsl2.s, hsl2.l);

  return [rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgbToHex(rgb2.r, rgb2.g, rgb2.b)];
}

// ============================================
// RANDOM NUMBER GENERATION
// ============================================

/** Create a seeded random number generator */
export function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s * 9999) * 10000;
    return s - Math.floor(s);
  };
}

/** Simple seeded random (stateful, for compatibility) */
export function seededRandom(seed: number): () => number {
  return createSeededRandom(seed);
}

// ============================================
// EXPORT
// ============================================

export const ColorUtils = {
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
  rgbToHsl,
  hslToRgb,
  rgbToGray,

  // Blending
  blendColors,
  blendRgb,
  alphaBlend,
  multiplyBlend,
  screenBlend,
  overlayBlend,

  // Gradients
  getGradientColor,
  createCssGradient,
  getGradientColorAt,

  // Contrast
  getRelativeLuminance,
  getContrastRatio,
  meetsContrastAA,
  meetsContrastAAA,
  adjustForContrast,
  isDark,
  getTextColor,

  // Palette
  getComplementary,
  getAnalogous,
  getTriadic,

  // Random
  createSeededRandom,
  seededRandom,
};

export default ColorUtils;
