/**
 * QR Generator Color Module
 * Color manipulation and per-module color effects
 */

import { blendColors, parseColor } from '../core';
import type { OverlayDataMatrix } from './cache';
import type { QRGeneratorConfig } from './types';
import { getContrastRatio } from './utils';

/**
 * Darken a color by a factor (0-1)
 */
export function darkenColor(color: string, factor: number): string {
  const hex = color.replace('#', '');
  const r = Math.round(Number.parseInt(hex.substr(0, 2), 16) * (1 - factor));
  const g = Math.round(Number.parseInt(hex.substr(2, 2), 16) * (1 - factor));
  const b = Math.round(Number.parseInt(hex.substr(4, 2), 16) * (1 - factor));
  return `rgb(${r},${g},${b})`;
}

/**
 * Lighten a color by a factor (0-1)
 */
export function lightenColor(color: string, factor: number): string {
  const hex = color.replace('#', '');
  const r = Math.round(
    Number.parseInt(hex.substr(0, 2), 16) + (255 - Number.parseInt(hex.substr(0, 2), 16)) * factor
  );
  const g = Math.round(
    Number.parseInt(hex.substr(2, 2), 16) + (255 - Number.parseInt(hex.substr(2, 2), 16)) * factor
  );
  const b = Math.round(
    Number.parseInt(hex.substr(4, 2), 16) + (255 - Number.parseInt(hex.substr(4, 2), 16)) * factor
  );
  return `rgb(${r},${g},${b})`;
}

/**
 * Apply per-module color mode
 */
export function applyPerModuleColor(
  mode: string,
  baseColor: string,
  overlayData: OverlayDataMatrix,
  row: number,
  col: number,
  moduleCount: number,
  config: QRGeneratorConfig
): string {
  const brightness = overlayData[row]?.[col] ?? 0.5;
  const overlayColor = overlayData.colors?.[row]?.[col];
  const intensity = (config.overlayIntensity || 100) / 100;

  switch (mode) {
    case 'by_brightness': {
      // Vary module color based on image brightness
      const parsed = parseColor(baseColor);
      if (!parsed) return baseColor;
      const factor = 0.5 + brightness * 0.5; // 0.5 to 1.0
      return `rgb(${Math.round(parsed.r * factor)},${Math.round(parsed.g * factor)},${Math.round(parsed.b * factor)})`;
    }

    case 'by_position': {
      // Color varies based on position in QR code
      const parsed = parseColor(baseColor);
      if (!parsed) return baseColor;
      const xFactor = col / moduleCount;
      const yFactor = row / moduleCount;
      const r = Math.round(parsed.r * (0.5 + xFactor * 0.5));
      const g = Math.round(parsed.g * (0.5 + yFactor * 0.5));
      const b = Math.round(parsed.b * (0.5 + (1 - xFactor) * 0.5));
      return `rgb(${r},${g},${b})`;
    }

    case 'by_overlay': {
      // Use overlay image color directly
      if (overlayColor) {
        // overlayColor is now {r, g, b} object, convert to rgb string for blending
        const colorStr = `rgb(${overlayColor.r},${overlayColor.g},${overlayColor.b})`;
        return blendColors(baseColor, colorStr, intensity);
      }
      return baseColor;
    }

    case 'by_cluster': {
      // Group nearby modules with similar colors
      const blockSize = 3;
      const blockRow = Math.floor(row / blockSize);
      const blockCol = Math.floor(col / blockSize);
      const seed = blockRow * 100 + blockCol;
      const hueShift = (seed * 37) % 360;
      const parsed = parseColor(baseColor);
      if (!parsed) return baseColor;
      // Simple hue rotation approximation
      const angle = (hueShift * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const r = Math.max(
        0,
        Math.min(
          255,
          parsed.r * (0.213 + cos * 0.787 - sin * 0.213) +
            parsed.g * (0.715 - cos * 0.715 - sin * 0.715) +
            parsed.b * (0.072 - cos * 0.072 + sin * 0.928)
        )
      );
      const g = Math.max(
        0,
        Math.min(
          255,
          parsed.r * (0.213 - cos * 0.213 + sin * 0.143) +
            parsed.g * (0.715 + cos * 0.285 + sin * 0.14) +
            parsed.b * (0.072 - cos * 0.072 - sin * 0.283)
        )
      );
      const b = Math.max(
        0,
        Math.min(
          255,
          parsed.r * (0.213 - cos * 0.213 - sin * 0.787) +
            parsed.g * (0.715 - cos * 0.715 + sin * 0.715) +
            parsed.b * (0.072 + cos * 0.928 + sin * 0.072)
        )
      );
      return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
    }

    default:
      return baseColor;
  }
}

/**
 * Ensure module color has sufficient contrast with background
 */
export function ensureContrast(moduleColor: string, bgColor: string, minRatio: number): string {
  try {
    const ratio = getContrastRatio(moduleColor, bgColor);
    if (ratio >= minRatio) {
      return moduleColor;
    }

    // Darken the module color to improve contrast
    const parsed = parseColor(moduleColor);
    if (!parsed) return moduleColor;
    let factor = 0.9;
    let newColor = moduleColor;

    // Iteratively darken until we meet contrast ratio
    for (let i = 0; i < 10; i++) {
      const r = Math.round(parsed.r * factor);
      const g = Math.round(parsed.g * factor);
      const b = Math.round(parsed.b * factor);
      newColor = `rgb(${r},${g},${b})`;

      const newRatio = getContrastRatio(newColor, bgColor);
      if (newRatio >= minRatio) {
        return newColor;
      }
      factor *= 0.85;
    }

    // If still not enough contrast, return black
    return '#000000';
  } catch (error) {
    console.warn('Contrast check failed:', error);
    return moduleColor;
  }
}

/**
 * Apply palette color to a module based on position/brightness
 */
export function applyPaletteColor(
  row: number,
  col: number,
  moduleCount: number,
  brightness: number,
  palette: string[],
  config: QRGeneratorConfig
): string {
  if (!palette || palette.length === 0) return config.fgColor;

  const paletteMode = config.paletteMode || 'position';

  switch (paletteMode) {
    case 'brightness': {
      // Map brightness to palette index
      const idx = Math.floor((1 - brightness) * (palette.length - 0.01));
      return palette[Math.max(0, Math.min(palette.length - 1, idx))];
    }
    case 'diagonal': {
      // Color based on diagonal position
      const diag = (row + col) / (moduleCount * 2);
      const idx = Math.floor(diag * palette.length) % palette.length;
      return palette[idx];
    }
    case 'radial': {
      // Color based on distance from center
      const cx = moduleCount / 2;
      const cy = moduleCount / 2;
      const dist = Math.hypot(row - cy, col - cx);
      const maxDist = Math.hypot(cx, cy);
      const idx = Math.floor((dist / maxDist) * palette.length) % palette.length;
      return palette[idx];
    }
    case 'random': {
      // Deterministic random based on position
      const hash = ((row * 31 + col) * 17) % palette.length;
      return palette[hash];
    }
    case 'row': {
      // Color by row
      const idx = Math.floor((row / moduleCount) * palette.length) % palette.length;
      return palette[idx];
    }
    case 'column': {
      // Color by column
      const idx = Math.floor((col / moduleCount) * palette.length) % palette.length;
      return palette[idx];
    }
    default: {
      // Cycle through palette based on linear position
      const linearPos = row * moduleCount + col;
      const idx = linearPos % palette.length;
      return palette[idx];
    }
  }
}
