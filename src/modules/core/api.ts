/**
 * Core Module - Public API Manifest
 *
 * This file documents all public exports from the core module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('CORE');

// Color parsing
export const PARSING_API = [
  'parseColor',
  'parseHex',
  'parseHexAlpha',
  'parseRgbString',
  'parseHslString',
] as const;

// Color conversion
export const CONVERSION_API = [
  'rgbToHex',
  'rgbToHsl',
  'rgbToHslTuple',
  'rgbToString',
  'rgbToGray',
  'rgbaToHex',
  'rgbaToString',
  'hslToRgb',
  'hslToRgbTuple',
] as const;

// Color blending
export const BLENDING_API = [
  'blendColors',
  'blendRgb',
  'alphaBlend',
  'multiplyBlend',
  'screenBlend',
  'overlayBlend',
] as const;

// Contrast
export const CONTRAST_API = [
  'getContrastRatio',
  'getRelativeLuminance',
  'getTextColor',
  'isDark',
  'meetsContrastAA',
  'meetsContrastAAA',
  'adjustForContrast',
] as const;

// Gradients
export const GRADIENT_API = [
  'getGradientColor',
  'getGradientColorAt',
  'createCssGradient',
] as const;

// Color harmony
export const HARMONY_API = ['getComplementary', 'getAnalogous', 'getTriadic'] as const;

// Math utilities
export const MATH_API = [
  'clamp',
  'clamp01',
  'lerp',
  'createRNG',
  'createSeededRandom',
  'seededRandom',
] as const;

// Types
export const TYPES = [
  'RGB',
  'RGBA',
  'HSL',
  'HSLA',
  'GradientConfig',
  'GradientStop',
  'GradientType',
] as const;

// All public exports
export const PUBLIC_API = [
  ...PARSING_API,
  ...CONVERSION_API,
  ...BLENDING_API,
  ...CONTRAST_API,
  ...GRADIENT_API,
  ...HARMONY_API,
  ...MATH_API,
] as const;
