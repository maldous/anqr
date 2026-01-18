/**
 * Core Color Utilities
 * Pure color math functions - NO DOM, canvas, or pixel dependencies
 */

import type { RGB, RGBA, HSL, HSLA } from './types';

// Re-export types for convenience
export type { RGB, RGBA, HSL, HSLA };

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

// Named colors lookup
const NAMED_COLORS: Record<string, string> = {
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

  if (NAMED_COLORS[color]) {
    return parseHexAlpha(NAMED_COLORS[color]);
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

/** Convert RGB to grayscale using luminance formula */
export function rgbToGray(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
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

/**
 * Convert HSL to RGB tuple [r, g, b] (0-255)
 * Variant that returns tuple format for use in animation patterns
 */
export function hslToRgbTuple(h: number, s: number, l: number): [number, number, number] {
  const rgb = hslToRgb(h, s, l);
  return [rgb.r, rgb.g, rgb.b];
}

/**
 * Convert RGB to HSL tuple [h, s, l]
 */
export function rgbToHslTuple(r: number, g: number, b: number): [number, number, number] {
  const hsl = rgbToHsl(r, g, b);
  return [hsl.h, hsl.s, hsl.l];
}

// ============================================
// COLOR BLENDING
// ============================================

/** Blend RGB values with ratio (0 = c1, 1 = c2) */
export function blendRgb(c1: RGB, c2: RGB, ratio: number): RGB {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * ratio),
    g: Math.round(c1.g + (c2.g - c1.g) * ratio),
    b: Math.round(c1.b + (c2.b - c1.b) * ratio),
  };
}

/** Blend two color strings with given ratio */
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
