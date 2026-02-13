/**
 * Overlay Mode Rendering
 * Applies overlay effects based on the selected mode
 */

import { createLogger } from '../../lib/logger';
import { blendColors, parseColor } from '../core';
import type { OverlayData, QRGeneratorConfig } from './types';

const _log = createLogger('GENERATE');

/**
 * Compute darkening factor for overlay colors on dark QR modules.
 * Scales linearly: at intensity 0 → 1.0 (no darkening), at intensity 1 → minFactor.
 * Each overlay mode can pass its own minFactor to set the maximum darkening at full intensity.
 */
export function computeDarkFactor(intensity: number, minFactor: number = 0.55): number {
  const i = Math.max(0, Math.min(1, intensity));
  return 1.0 - (1.0 - minFactor) * i;
}

/**
 * Compute blend amount toward white for overlay colors on light QR modules.
 * Scales linearly: at intensity 0 → 0 (no lightening), at intensity 1 → maxBlend.
 */
export function computeLightBlend(intensity: number, maxBlend: number = 0.4): number {
  const i = Math.max(0, Math.min(1, intensity));
  return maxBlend * i;
}

function applyBrightnessCurve(brightness: number, curve: string | number | undefined): number {
  if (curve === 's-curve' || curve === 's_curve') {
    return brightness * brightness * (3 - 2 * brightness);
  }
  if (curve === 'gamma') {
    return brightness ** 0.7;
  }
  return brightness;
}

/** Maximum lightening applied to shadow color in duotone bright-area fallback (no highlight color). */
const DUOTONE_MAX_LIGHTEN = 0.5;

export interface OverlayModeResult {
  moduleColor: string;
  moduleSizeModifier: number;
  moduleOpacity: number;
  waveOffsetX: number;
  waveOffsetY: number;
  drawOutlineOnly: boolean;
  useHalftoneRendering: boolean;
  halftoneBrightness: number;
  shouldDrawCell: boolean;
}

/**
 * Apply overlay mode effects to a module
 * Returns modified rendering parameters based on overlay mode and brightness
 */
export function applyQROverlayMode(
  overlayMode: string | undefined,
  isDark: boolean,
  brightness: number,
  overlayData: OverlayData,
  row: number,
  col: number,
  moduleCount: number,
  effectiveIntensity: number,
  config: QRGeneratorConfig
): OverlayModeResult {
  const result: OverlayModeResult = {
    moduleColor: isDark ? config.fgColor : config.bgColor,
    moduleSizeModifier: 1,
    moduleOpacity: 1,
    waveOffsetX: 0,
    waveOffsetY: 0,
    drawOutlineOnly: false,
    useHalftoneRendering: false,
    halftoneBrightness: 0.5,
    shouldDrawCell: isDark,
  };

  // Type guard for overlayData with colors
  // OverlayData.colors uses object indexing: colors[row][col] = { r, g, b }
  const overlayWithColors = overlayData as {
    colors?: { [row: number]: { [col: number]: { r: number; g: number; b: number } } };
  };

  switch (overlayMode) {
    case 'halftone':
      if (isDark) {
        // Use halftone params if available
        if (config.halftoneCell || config.halftoneDotShape || config.brightnessCurve) {
          // Store brightness for halftone rendering - will be handled specially below
          result.useHalftoneRendering = true;
          const transformedBrightness = applyBrightnessCurve(brightness, config.brightnessCurve);
          result.halftoneBrightness = 0.5 + (transformedBrightness - 0.5) * effectiveIntensity;
        } else {
          // Legacy halftone behavior with improved size mapping
          const intensity = effectiveIntensity; // 0..1
          // Min size scales with intensity: higher intensity allows smaller dots for more detail
          // At intensity 0: 0.25 (visible base size), at intensity 1: 0.15 (finer detail)
          const minSize = 0.15 + 0.1 * (1 - intensity);
          const maxSize = 1.0;
          const sizeRange = maxSize - minSize;
          const darknessInfluence = (1 - brightness) * intensity;
          const baseSize = minSize + sizeRange * (1 - intensity) * 0.5;
          result.moduleSizeModifier = baseSize + darknessInfluence * (maxSize - baseSize);
        }
      }
      break;

    case 'halftone-dithered': {
      result.useHalftoneRendering = true;
      result.shouldDrawCell = true;
      const htdColor = overlayWithColors.colors?.[row]?.[col];
      const htdTransformed = applyBrightnessCurve(brightness, config.brightnessCurve);

      if (isDark) {
        result.halftoneBrightness = 0.5 + (htdTransformed - 0.5) * effectiveIntensity;
        if (htdColor) {
          // Keep dark-module dots clearly dark for scanner contrast.
          const dkF = computeDarkFactor(effectiveIntensity, 0.35);
          result.moduleColor = `rgb(${Math.round(htdColor.r * dkF)},${Math.round(htdColor.g * dkF)},${Math.round(htdColor.b * dkF)})`;
        }
      } else {
        // Keep light-module dots small/subtle so background image remains visible.
        result.halftoneBrightness = Math.max(
          0.68,
          0.5 + (htdTransformed - 0.5) * effectiveIntensity
        );
        if (htdColor) {
          const ltBlend = computeLightBlend(effectiveIntensity, 0.72);
          const lightR = Math.round(htdColor.r + (255 - htdColor.r) * ltBlend);
          const lightG = Math.round(htdColor.g + (255 - htdColor.g) * ltBlend);
          const lightB = Math.round(htdColor.b + (255 - htdColor.b) * ltBlend);
          result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
        }
      }
      break;
    }

    case 'blend':
      if (isDark) {
        const blendColor = overlayWithColors.colors?.[row]?.[col];
        if (blendColor) {
          const blendAmount = effectiveIntensity; // 0..1
          const darkFactor = computeDarkFactor(blendAmount, 0.75);
          const darkR = Math.round(blendColor.r * darkFactor);
          const darkG = Math.round(blendColor.g * darkFactor);
          const darkB = Math.round(blendColor.b * darkFactor);
          result.moduleColor = blendColors(
            config.fgColor,
            `rgb(${darkR},${darkG},${darkB})`,
            blendAmount
          );
        }
      }
      break;

    case 'brightness':
      if (isDark) {
        const threshold = 1 - effectiveIntensity; // effectiveIntensity is 0..1
        if (brightness > threshold) {
          result.moduleOpacity = 0;
        }
      }
      break;

    case 'gapfill':
      // Fill white spaces with faded image colors - creates ghosted image effect
      if (isDark) {
        result.moduleColor = config.fgColor;
      } else {
        const gapColor = overlayWithColors.colors?.[row]?.[col];
        if (gapColor) {
          // Fade amount derived from intensity (already ECC-capped)
          const fadeAmount = computeLightBlend(effectiveIntensity, 0.75);
          const colorStr = `rgb(${gapColor.r},${gapColor.g},${gapColor.b})`;
          result.moduleColor = blendColors(config.bgColor, colorStr, fadeAmount);
          result.shouldDrawCell = true;
        }
      }
      break;

    case 'pixelate':
      // True pixelation - 3x3 blocks get same averaged color for chunky pixel look
      if (isDark) {
        const blockSize = 3;
        const blockRow = Math.floor(row / blockSize) * blockSize;
        const blockCol = Math.floor(col / blockSize) * blockSize;
        let avgR = 0,
          avgG = 0,
          avgB = 0,
          pixCount = 0;
        for (let br = 0; br < blockSize && blockRow + br < moduleCount; br++) {
          for (let bc = 0; bc < blockSize && blockCol + bc < moduleCount; bc++) {
            const c = overlayWithColors.colors?.[blockRow + br]?.[blockCol + bc];
            if (c) {
              avgR += c.r;
              avgG += c.g;
              avgB += c.b;
              pixCount++;
            }
          }
        }
        if (pixCount > 0) {
          avgR = Math.round(avgR / pixCount);
          avgG = Math.round(avgG / pixCount);
          avgB = Math.round(avgB / pixCount);
          const pixIntensity = effectiveIntensity;
          const darkFactor = computeDarkFactor(pixIntensity, 0.7);
          const darkR = Math.round(avgR * darkFactor);
          const darkG = Math.round(avgG * darkFactor);
          const darkB = Math.round(avgB * darkFactor);
          const blockColor = `rgb(${darkR},${darkG},${darkB})`;
          result.moduleColor = blendColors(config.fgColor, blockColor, pixIntensity);
        }
      }
      break;

    case 'duotone':
      if (isDark) {
        // duotoneColors is an array [shadowColor, highlightColor] from the store
        const duotoneArr = config.duotoneColors || [];
        const shadowColor = duotoneArr[0] || config.fgColor;
        const highlightColor = duotoneArr[1] || null;
        const duoIntensity = effectiveIntensity;

        // Use a smoother gradient between shadow and highlight colors
        // This creates more visually appealing duotone effect
        if (highlightColor) {
          // Full duotone: blend between shadow and highlight based on brightness
          // brightness 0 -> full shadow, brightness 1 -> full highlight
          const shadowParsed = parseColor(shadowColor) ?? { r: 0, g: 0, b: 0, a: 1 };
          const highlightParsed = parseColor(highlightColor) ?? { r: 0, g: 0, b: 0, a: 1 };

          // Apply intensity to control how much duotone effect is applied
          const duoR = Math.round(
            shadowParsed.r + (highlightParsed.r - shadowParsed.r) * brightness
          );
          const duoG = Math.round(
            shadowParsed.g + (highlightParsed.g - shadowParsed.g) * brightness
          );
          const duoB = Math.round(
            shadowParsed.b + (highlightParsed.b - shadowParsed.b) * brightness
          );
          const duoColor = `rgb(${duoR},${duoG},${duoB})`;

          // Blend from fgColor to duotone color based on intensity
          result.moduleColor = blendColors(config.fgColor, duoColor, duoIntensity);
        } else if (brightness > 0.5) {
          // Fallback: lighten the shadow color for bright areas
          const shadowParsed = parseColor(shadowColor) ?? { r: 0, g: 0, b: 0, a: 1 };
          const lightenAmt = (brightness - 0.5) * 2 * duoIntensity;
          const lightR = Math.min(
            255,
            Math.round(shadowParsed.r + (255 - shadowParsed.r) * lightenAmt * DUOTONE_MAX_LIGHTEN)
          );
          const lightG = Math.min(
            255,
            Math.round(shadowParsed.g + (255 - shadowParsed.g) * lightenAmt * DUOTONE_MAX_LIGHTEN)
          );
          const lightB = Math.min(
            255,
            Math.round(shadowParsed.b + (255 - shadowParsed.b) * lightenAmt * DUOTONE_MAX_LIGHTEN)
          );
          result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
        } else {
          // Dark areas get shadow color blended with fg
          result.moduleColor = blendColors(
            config.fgColor,
            shadowColor,
            duoIntensity * (0.5 - brightness) * 2
          );
        }
      }
      break;

    case 'outline':
      if (isDark) {
        result.drawOutlineOnly = true;
        const outlineColor = overlayWithColors.colors?.[row]?.[col];
        if (outlineColor) {
          const outlineBlend = effectiveIntensity;
          const darkFactor = computeDarkFactor(outlineBlend, 0.75);
          const darkR = Math.round(outlineColor.r * darkFactor);
          const darkG = Math.round(outlineColor.g * darkFactor);
          const darkB = Math.round(outlineColor.b * darkFactor);
          const colorStr = `rgb(${darkR},${darkG},${darkB})`;
          result.moduleColor = blendColors(config.fgColor, colorStr, outlineBlend);
        }
      }
      break;

    case 'wave':
      if (isDark) {
        const waveIntensity = effectiveIntensity;
        const waveStrength = (1 - brightness) * waveIntensity * 4;
        result.waveOffsetX = Math.sin(row * 0.5 + col * 0.15) * waveStrength;
        result.waveOffsetY = Math.cos(col * 0.5 + row * 0.15) * waveStrength;

        const waveColor = overlayWithColors.colors?.[row]?.[col];
        if (waveColor && waveIntensity > 0) {
          const darkFactor = computeDarkFactor(waveIntensity, 0.7);
          const colorStr = `rgb(${Math.round(waveColor.r * darkFactor)},${Math.round(waveColor.g * darkFactor)},${Math.round(waveColor.b * darkFactor)})`;
          result.moduleColor = blendColors(config.fgColor, colorStr, waveIntensity);
        }
      }
      break;

    case 'mosaic': {
      // Mosaic fills EVERY cell with image colors - reveals full image
      result.shouldDrawCell = true;
      const mosaicColor = overlayWithColors.colors?.[row]?.[col];
      if (mosaicColor) {
        const mosaicIntensity = effectiveIntensity; // 0..1
        if (isDark) {
          const darkFactor = computeDarkFactor(mosaicIntensity, 0.8);
          result.moduleColor = `rgb(${Math.round(mosaicColor.r * darkFactor)},${Math.round(mosaicColor.g * darkFactor)},${Math.round(mosaicColor.b * darkFactor)})`;
        } else {
          // Light cells: blend toward white for scanner contrast.
          // Base 0.4 ensures light cells are always significantly lighter than dark cells.
          // Additional lightening scales with intensity via computeLightBlend.
          const blendToWhite = 0.4 + computeLightBlend(mosaicIntensity, 0.3);
          const lightR = Math.round(mosaicColor.r + (255 - mosaicColor.r) * blendToWhite);
          const lightG = Math.round(mosaicColor.g + (255 - mosaicColor.g) * blendToWhite);
          const lightB = Math.round(mosaicColor.b + (255 - mosaicColor.b) * blendToWhite);
          result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
        }
      }
      break;
    }

    case 'artwork': {
      // Artwork mode: True QR-Art rendering (Russ Cox algorithm)
      // The image appears through the DATA MODULE PATTERN, not visual effects.
      // The QR-Art fragment search finds URL fragments that produce QR data
      // modules matching the target image - we just render normally as pure B&W.
      //
      // This is fundamentally different from other overlay modes:
      // - Other modes: modify how modules LOOK (size, color, fill)
      // - Artwork mode: modify what DATA is encoded to control which modules are dark/light
      //
      // The overlay image is used only for SCORING during fragment search,
      // not for visual post-processing during rendering.
      result.shouldDrawCell = isDark; // Normal QR rendering - only draw dark modules
      result.moduleColor = isDark ? config.fgColor : config.bgColor; // Pure black/white
      result.moduleSizeModifier = 1; // Full size modules, no halftone
      // No fills, no tinting - the art IS the QR pattern itself
      break;
    }
  }

  return result;
}
