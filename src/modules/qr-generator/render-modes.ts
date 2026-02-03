/**
 * Overlay Mode Rendering
 * Applies overlay effects based on the selected mode
 */

import { createLogger } from '../../lib/logger';
import { blendColors, parseColor } from '../core';
import type { OverlayData, QRGeneratorConfig } from './types';

const _log = createLogger('GENERATE');

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
          // Apply brightness curve transformation
          let transformedBrightness = brightness;
          const curve = config.brightnessCurve;
          if (curve === 's-curve' || curve === 's_curve') {
            // S-curve: more contrast in midtones
            transformedBrightness = brightness * brightness * (3 - 2 * brightness);
          } else if (curve === 'gamma') {
            // Gamma curve: lift shadows
            transformedBrightness = Math.pow(brightness, 0.7);
          }
          // 'linear' is the default - no transformation needed
          // Apply intensity to control how much the overlay brightness affects dot size
          // At intensity 0: all dots same size (neutral 0.5 brightness)
          // At intensity 100%: full variation based on overlay brightness
          result.halftoneBrightness = 0.5 + (transformedBrightness - 0.5) * effectiveIntensity;
        } else {
          // Legacy halftone behavior with improved size mapping
          const intensity = effectiveIntensity; // 0..1
          // Min size 0.25 ensures dots are always visible
          // Max size 1.0 allows full coverage for dark areas
          const minSize = 0.25;
          const maxSize = 1.0;
          // Use a smoother curve for size variation - darker = larger dots
          // Apply intensity to control the strength of the effect
          const sizeRange = maxSize - minSize;
          const darknessInfluence = (1 - brightness) * intensity;
          const baseSize = minSize + (sizeRange * (1 - intensity) * 0.5); // Base size when no overlay effect
          result.moduleSizeModifier = baseSize + darknessInfluence * (maxSize - baseSize);
        }
      }
      break;

    case 'blend':
      if (isDark) {
        const blendColor = overlayWithColors.colors?.[row]?.[col];
        if (blendColor) {
          // Apply moderate darkening to preserve QR scannability at high intensity
          // At 100% intensity, colors are darkened by 25% to ensure dark modules stay dark
          const blendAmount = effectiveIntensity; // 0..1
          const darkFactor = 0.75 + (1 - blendAmount) * 0.25; // 0.75 at full intensity, 1.0 at zero
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
        // Draw white spaces with visible image color
        const gapColor = overlayWithColors.colors?.[row]?.[col];
        if (gapColor) {
          // Max 60% opacity allows image to show through more clearly
          // while maintaining enough contrast for QR readability
          const fadeAmount = effectiveIntensity * 0.6;
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
          // Apply moderate darkening to averaged color for QR contrast
          // This ensures dark modules remain scannable while showing vibrant colors
          const pixIntensity = effectiveIntensity;
          const darkFactor = 0.7 + (1 - pixIntensity) * 0.3; // 0.7 at 100% intensity, 1.0 at 0%
          const darkR = Math.round(avgR * darkFactor);
          const darkG = Math.round(avgG * darkFactor);
          const darkB = Math.round(avgB * darkFactor);
          // Blend from fgColor to darkened block color based on intensity
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
          const shadowParsed = parseColor(shadowColor);
          const highlightParsed = parseColor(highlightColor);
          
          // Apply intensity to control how much duotone effect is applied
          const duoR = Math.round(shadowParsed.r + (highlightParsed.r - shadowParsed.r) * brightness);
          const duoG = Math.round(shadowParsed.g + (highlightParsed.g - shadowParsed.g) * brightness);
          const duoB = Math.round(shadowParsed.b + (highlightParsed.b - shadowParsed.b) * brightness);
          const duoColor = `rgb(${duoR},${duoG},${duoB})`;
          
          // Blend from fgColor to duotone color based on intensity
          result.moduleColor = blendColors(config.fgColor, duoColor, duoIntensity);
        } else if (brightness > 0.5) {
          // Fallback: lighten the shadow color for bright areas
          const shadowParsed = parseColor(shadowColor);
          const lightenAmt = (brightness - 0.5) * 2 * duoIntensity;
          const lightR = Math.min(255, Math.round(shadowParsed.r + (255 - shadowParsed.r) * lightenAmt * 0.5));
          const lightG = Math.min(255, Math.round(shadowParsed.g + (255 - shadowParsed.g) * lightenAmt * 0.5));
          const lightB = Math.min(255, Math.round(shadowParsed.b + (255 - shadowParsed.b) * lightenAmt * 0.5));
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
          // Apply moderate darkening to preserve visibility of outlines
          const outlineBlend = effectiveIntensity;
          const darkFactor = 0.75 + (1 - outlineBlend) * 0.25;
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
        // Wave effect creates flowing distortion based on image brightness
        // Darker areas have more wave displacement for interesting visual effect
        const waveIntensity = effectiveIntensity;
        const waveStrength = (1 - brightness) * waveIntensity * 4; // Increased from 3 to 4 for more dramatic effect
        // Use different frequencies for X and Y to create more organic wave pattern
        result.waveOffsetX = Math.sin(row * 0.5 + col * 0.15) * waveStrength;
        result.waveOffsetY = Math.cos(col * 0.5 + row * 0.15) * waveStrength;
        
        // Also apply color from overlay for added visual interest
        const waveColor = overlayWithColors.colors?.[row]?.[col];
        if (waveColor && waveIntensity > 0.3) {
          // Darken overlay color for QR readability, blend based on intensity
          const darkFactor = 0.7;
          const colorStr = `rgb(${Math.round(waveColor.r * darkFactor)},${Math.round(waveColor.g * darkFactor)},${Math.round(waveColor.b * darkFactor)})`;
          result.moduleColor = blendColors(config.fgColor, colorStr, waveIntensity * 0.7);
        }
      }
      break;

    case 'mosaic': {
      // Mosaic fills EVERY cell with image colors - reveals full image
      // Dark modules get actual color, white spaces get lighter version
      result.shouldDrawCell = true; // Draw all cells
      const mosaicColor = overlayWithColors.colors?.[row]?.[col];
      if (mosaicColor) {
        const intensity = effectiveIntensity; // 0..1
        if (isDark) {
          // Dark cells get the actual image color (moderately darkened to maintain QR readability)
          // Using 0.8 preserves more color vibrancy while ensuring dark modules read as "dark"
          const darkFactor = 0.8;
          result.moduleColor = `rgb(${Math.round(mosaicColor.r * darkFactor)},${Math.round(mosaicColor.g * darkFactor)},${Math.round(mosaicColor.b * darkFactor)})`;
        } else {
          // White cells get a lighter version of the image color
          // At full intensity (1.0), lightFactor=0.3 gives subtle lightening
          // At zero intensity (0.0), lightFactor=0.6 gives stronger lightening for more contrast
          const lightFactor = 0.3 + (1 - intensity) * 0.3;
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
