/**
 * QR Generator Overlay Subpixel Module
 * Handles subpixel overlay data extraction and matrix generation
 */

import { parseColor } from '../color-utils.ts';
import { isFinderPattern } from '../qr-core.ts';
import { preprocessImageData } from './filters.js';
import { getOverlayData } from './overlay-data.js';

/**
 * Get subpixel overlay data - async version using canvas factory
 * Now supports preprocessing via config parameter
 */
export async function getSubpixelOverlayData(
  overlayCanvas,
  subpixelCount,
  colorMode,
  config,
  createCanvasFn
) {
  const tempCanvas = await createCanvasFn(subpixelCount, subpixelCount);
  const ctx = tempCanvas.getContext('2d');

  ctx.drawImage(overlayCanvas, 0, 0, subpixelCount, subpixelCount);

  const imageData = ctx.getImageData(0, 0, subpixelCount, subpixelCount);

  // Apply preprocessing if config is provided
  preprocessImageData(imageData, config, config.invertImage);

  const data = imageData.data;

  const brightness = [];
  const colors = [];

  for (let row = 0; row < subpixelCount; row++) {
    brightness[row] = [];
    colors[row] = [];

    for (let col = 0; col < subpixelCount; col++) {
      const i = (row * subpixelCount + col) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
      brightness[row][col] = gray / 255;

      if (colorMode === 'bw') {
        const bw = gray > 127 ? 255 : 0;
        colors[row][col] = `rgb(${bw},${bw},${bw})`;
      } else if (colorMode === 'grayscale') {
        colors[row][col] = `rgb(${gray},${gray},${gray})`;
      } else {
        colors[row][col] = `rgb(${r},${g},${b})`;
      }
    }
  }

  brightness.colors = colors;
  return brightness;
}

/**
 * Generate subpixel matrix for subpixel/subpixel-size modes.
 * Each module becomes NxN pixels where center=QR data, surrounding=image.
 */
export async function generateSubpixelMatrix(
  qr,
  config,
  overlayCanvas,
  moduleCount,
  scale,
  useHalftoneCenter,
  createCanvasFn
) {
  const scaledSize = moduleCount * scale;
  const matrix = [];
  const colors = [];

  // Get overlay data at scaled resolution
  const overlayData = await getSubpixelOverlayData(
    overlayCanvas,
    scaledSize,
    config.colorMode || 'color',
    config,
    createCanvasFn
  );
  // Also get per-module brightness for halftone center
  const moduleBrightness = await getOverlayData(
    overlayCanvas,
    moduleCount,
    'color',
    false,
    config.frameIndex || 0,
    {},
    createCanvasFn
  );

  const intensity = (config.overlayIntensity ?? 100) / 100;
  const centerIdx = Math.floor(scale / 2);
  const centerRule = config.subpixelCenterRule || 'strict';
  const finderOverride = config.subpixelFinderOverride || 'solid';
  const neutralColor = config.subpixelNeutralColor || '#808080';
  const neutralParsed = parseColor(neutralColor);

  for (let moduleRow = 0; moduleRow < moduleCount; moduleRow++) {
    for (let moduleCol = 0; moduleCol < moduleCount; moduleCol++) {
      const isDark = qr.isDark(moduleRow, moduleCol);
      const isFinder = isFinderPattern(moduleRow, moduleCol, moduleCount);

      for (let subRow = 0; subRow < scale; subRow++) {
        for (let subCol = 0; subCol < scale; subCol++) {
          const y = moduleRow * scale + subRow;
          const x = moduleCol * scale + subCol;

          if (!matrix[y]) {
            matrix[y] = [];
            colors[y] = [];
          }

          // For finder patterns with solid override, fill entire block
          if (isFinder && finderOverride === 'solid') {
            matrix[y][x] = isDark;
            colors[y][x] = isDark ? parseColor(config.fgColor) : parseColor(config.bgColor);
            continue;
          }

          const isCenter = subRow === centerIdx && subCol === centerIdx;

          if (isCenter) {
            // CENTER pixel - MUST show QR data for scannability
            const useHalftone = useHalftoneCenter || centerRule === 'halftone_center';
            if (useHalftone && isDark) {
              // Halftone center uses brightness to vary appearance
              const brightness = moduleBrightness[moduleRow]?.[moduleCol] ?? 0.5;
              const minSize = 0.4;
              const maxSize = 1;
              const sizeRatio = minSize + (1 - brightness) * (maxSize - minSize) * intensity;
              // For the matrix, we still mark it as dark
              matrix[y][x] = true;
              // Store a flag in color for halftone rendering
              colors[y][x] = {
                r: 0,
                g: 0,
                b: 0,
                halftone: true,
                sizeRatio,
              };
            } else {
              matrix[y][x] = isDark;
              colors[y][x] = isDark ? parseColor(config.fgColor) : parseColor(config.bgColor);
            }
          } else {
            // SURROUNDING pixels - show overlay image
            const overlayColor = overlayData.colors?.[y]?.[x];
            if (overlayColor && intensity > 0) {
              let parsed;
              if (typeof overlayColor === 'string') {
                parsed = parseColor(overlayColor);
              } else {
                parsed = overlayColor;
              }
              if (intensity >= 1) {
                matrix[y][x] = parsed.r * 0.299 + parsed.g * 0.587 + parsed.b * 0.114 < 128;
                colors[y][x] = parsed;
              } else {
                // Blend with neutral
                const blended = {
                  r: Math.round(neutralParsed.r + (parsed.r - neutralParsed.r) * intensity),
                  g: Math.round(neutralParsed.g + (parsed.g - neutralParsed.g) * intensity),
                  b: Math.round(neutralParsed.b + (parsed.b - neutralParsed.b) * intensity),
                };
                matrix[y][x] = blended.r * 0.299 + blended.g * 0.587 + blended.b * 0.114 < 128;
                colors[y][x] = blended;
              }
            } else if (isDark) {
              // No overlay - show based on QR pattern with reduced contrast
              const darkened = {
                r: Math.round(neutralParsed.r * 0.5),
                g: Math.round(neutralParsed.g * 0.5),
                b: Math.round(neutralParsed.b * 0.5),
              };
              matrix[y][x] = true;
              colors[y][x] = darkened;
            } else {
              const lightened = {
                r: Math.round(255 - (255 - neutralParsed.r) * 0.5),
                g: Math.round(255 - (255 - neutralParsed.g) * 0.5),
                b: Math.round(255 - (255 - neutralParsed.b) * 0.5),
              };
              matrix[y][x] = false;
              colors[y][x] = lightened;
            }
          }
        }
      }
    }
  }

  return {
    matrix,
    colors,
    scale,
    overlayData: moduleBrightness,
    effectiveIntensity: intensity * 100,
  };
}
