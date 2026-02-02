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

import { createLogger } from '../../lib/logger';

const _log = createLogger('CORE');

// Color utilities
export {
  alphaBlend,
  blendColors,
  // Blending
  blendRgb,
  getContrastRatio,
  // Contrast
  getRelativeLuminance,
  getTextColor,
  hslToRgb,
  hslToRgbTuple,
  isDark,
  multiplyBlend,
  overlayBlend,
  parseColor,
  // Parsing
  parseHex,
  parseHexAlpha,
  parseHslString,
  parseRgbString,
  rgbaToHex,
  rgbaToString,
  rgbToGray,
  // Conversion
  rgbToHex,
  rgbToHsl,
  rgbToHslTuple,
  rgbToString,
  screenBlend,
} from './color';
// Contrast utilities
export {
  adjustForContrast,
  meetsContrastAA,
  meetsContrastAAA,
} from './contrast';
// Gradient utilities
export {
  createCssGradient,
  getGradientColor,
  getGradientColorAt,
} from './gradient';
// Color harmony utilities
export {
  getAnalogous,
  getComplementary,
  getTriadic,
} from './harmony';
// Math utilities
// Alias for backwards compatibility
export {
  clamp,
  clamp01,
  createRNG,
  createSeededRandom,
  createSeededRandom as seededRandom,
  lerp,
} from './math';
// Types
export type { GradientConfig, GradientStop, GradientType, HSL, HSLA, RGB, RGBA } from './types';
