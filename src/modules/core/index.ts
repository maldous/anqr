/**
 * Core Module
 * Pure utilities with no dependencies - the foundation layer
 * 
 * This module provides:
 * - Color parsing, conversion, and manipulation
 * - Math utilities (clamp, random, interpolation)
 * - Basic types (RGB, RGBA, HSL)
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
