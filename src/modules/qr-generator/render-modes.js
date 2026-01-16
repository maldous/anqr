/**
 * Overlay Mode Rendering
 * Applies overlay effects based on the selected mode
 */

import { blendColors, parseColor } from '../color-utils.ts';

/**
 * Apply overlay mode effects to a module
 * Returns modified rendering parameters based on overlay mode and brightness
 *
 * @param {string} overlayMode - The overlay mode
 * @param {boolean} isDark - Whether module is dark
 * @param {number} brightness - Brightness value (0-1)
 * @param {object} overlayData - Full overlay data with colors
 * @param {number} row - Module row
 * @param {number} col - Module column
 * @param {number} moduleCount - Total modules
 * @param {number} effectiveIntensity - Adjusted intensity (0-100)
 * @param {object} config - Generator config
 * @returns {object} Modified rendering parameters
 */
export function applyOverlayMode(
  overlayMode,
  isDark,
  brightness,
  overlayData,
  row,
  col,
  moduleCount,
  effectiveIntensity,
  config
) {
  const result = {
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
        const blendColor = overlayData.colors?.[row]?.[col];
        if (blendColor) {
          const blendAmount = effectiveIntensity / 100;
          result.moduleColor = blendColors(config.fgColor, blendColor, blendAmount);
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
        const gapColor = overlayData.colors?.[row]?.[col];
        if (gapColor) {
          const fadeAmount = (config.overlayIntensity / 100) * 0.4; // Max 40% opacity
          result.moduleColor = blendColors(config.bgColor, gapColor, fadeAmount);
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
            const c = overlayData.colors?.[blockRow + br]?.[blockCol + bc];
            if (c) {
              const parsed = parseColor(c);
              avgR += parsed.r;
              avgG += parsed.g;
              avgB += parsed.b;
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
        const outlineColor = overlayData.colors?.[row]?.[col];
        if (outlineColor) {
          const outlineBlend = config.overlayIntensity / 100;
          result.moduleColor = blendColors(config.fgColor, outlineColor, outlineBlend);
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
      const mosaicColor = overlayData.colors?.[row]?.[col];
      if (mosaicColor) {
        const intensity = effectiveIntensity / 100;
        if (isDark) {
          // Dark cells get the actual image color (darkened slightly to maintain QR readability)
          const parsed = parseColor(mosaicColor);
          const darkFactor = 0.7;
          result.moduleColor = `rgb(${Math.round(parsed.r * darkFactor)},${Math.round(parsed.g * darkFactor)},${Math.round(parsed.b * darkFactor)})`;
        } else {
          // White cells get a lighter/brighter version of the image color
          const parsed = parseColor(mosaicColor);
          const lightFactor = 0.4 + (1 - intensity) * 0.4;
          const lightR = Math.round(255 - (255 - parsed.r) * lightFactor);
          const lightG = Math.round(255 - (255 - parsed.g) * lightFactor);
          const lightB = Math.round(255 - (255 - parsed.b) * lightFactor);
          result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
        }
      }
      break;
    }
  }

  return result;
}
