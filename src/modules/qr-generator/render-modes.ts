/**
 * Overlay Mode Rendering
 * Applies overlay effects based on the selected mode
 */

import { blendColors, parseColor } from '../core';
import type { OverlayData, QRGeneratorConfig } from './types';

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
          result.halftoneBrightness = brightness;
        } else {
          // Legacy halftone behavior
          const intensity = effectiveIntensity / 100;
          const minSize = 0.3;
          const maxSize = 1;
          result.moduleSizeModifier =
            minSize +
            (1 - brightness) * (maxSize - minSize) * intensity +
            ((1 - intensity) * (maxSize - minSize)) / 2;
        }
      }
      break;

    case 'blend':
      if (isDark) {
        const blendColor = overlayWithColors.colors?.[row]?.[col];
        if (blendColor) {
          const blendAmount = effectiveIntensity / 100;
          result.moduleColor = blendColors(
            config.fgColor,
            `rgb(${blendColor.r},${blendColor.g},${blendColor.b})`,
            blendAmount
          );
        }
      }
      break;

    case 'brightness':
      if (isDark) {
        const threshold = (100 - effectiveIntensity) / 100;
        if (brightness > threshold) {
          result.moduleOpacity = 0;
        }
      }
      break;

    case 'gapfill':
      // Fill white spaces with faded image colors
      if (isDark) {
        result.moduleColor = config.fgColor;
      } else {
        // Draw white spaces with faded image color
        const gapColor = overlayWithColors.colors?.[row]?.[col];
        if (gapColor) {
          const fadeAmount = (config.overlayIntensity / 100) * 0.4; // Max 40% opacity
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
          const blockColor = `rgb(${avgR},${avgG},${avgB})`;
          const pixBlendAmt = config.overlayIntensity / 100;
          result.moduleColor = blendColors(config.fgColor, blockColor, pixBlendAmt);
        }
      }
      break;

    case 'duotone':
      if (isDark) {
        // duotoneColors is an array [shadowColor, highlightColor] from the store
        const duotoneArr = config.duotoneColors || [];
        const shadowColor = duotoneArr[0] || config.fgColor;
        const highlightColor = duotoneArr[1] || null;
        const intensity = config.overlayIntensity / 100;

        if (brightness > 0.5 && highlightColor) {
          // Bright areas get highlight color
          result.moduleColor = blendColors(
            config.fgColor,
            highlightColor,
            intensity * (brightness - 0.5) * 2
          );
        } else if (brightness > 0.5) {
          // Fallback: lighten the foreground color
          const fgParsed = parseColor(config.fgColor);
          const lightR = Math.min(255, fgParsed.r + 80);
          const lightG = Math.min(255, fgParsed.g + 80);
          const lightB = Math.min(255, fgParsed.b + 80);
          result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
        } else {
          // Dark areas get shadow color
          result.moduleColor = blendColors(
            config.fgColor,
            shadowColor,
            intensity * (0.5 - brightness) * 2
          );
        }
      }
      break;

    case 'outline':
      if (isDark) {
        result.drawOutlineOnly = true;
        const outlineColor = overlayWithColors.colors?.[row]?.[col];
        if (outlineColor) {
          const outlineBlend = config.overlayIntensity / 100;
          const colorStr = `rgb(${outlineColor.r},${outlineColor.g},${outlineColor.b})`;
          result.moduleColor = blendColors(config.fgColor, colorStr, outlineBlend);
        }
      }
      break;

    case 'wave':
      if (isDark) {
        const waveAmt = (1 - brightness) * (config.overlayIntensity / 100) * 3;
        result.waveOffsetX = Math.sin(row * 0.5) * waveAmt;
        result.waveOffsetY = Math.cos(col * 0.5) * waveAmt;
      }
      break;

    case 'mosaic': {
      // Mosaic fills EVERY cell with image colors - reveals full image
      // Dark modules get actual color, white spaces get lighter version
      result.shouldDrawCell = true; // Draw all cells
      const mosaicColor = overlayWithColors.colors?.[row]?.[col];
      if (mosaicColor) {
        const intensity = effectiveIntensity / 100;
        if (isDark) {
          // Dark cells get the actual image color (darkened slightly to maintain QR readability)
          const darkFactor = 0.7;
          result.moduleColor = `rgb(${Math.round(mosaicColor.r * darkFactor)},${Math.round(mosaicColor.g * darkFactor)},${Math.round(mosaicColor.b * darkFactor)})`;
        } else {
          // White cells get a lighter/brighter version of the image color
          const lightFactor = 0.4 + (1 - intensity) * 0.4;
          const lightR = Math.round(255 - (255 - mosaicColor.r) * lightFactor);
          const lightG = Math.round(255 - (255 - mosaicColor.g) * lightFactor);
          const lightB = Math.round(255 - (255 - mosaicColor.b) * lightFactor);
          result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
        }
      }
      break;
    }
  }

  return result;
}
