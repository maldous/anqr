/**
 * QR Generator Overlay Processing Module
 * Handles loading and processing overlay images
 */

import { parseColor } from '../color-utils.ts';
import { isFinderPattern } from '../qr-core.ts';
import { overlayDataCache } from './cache.js';
import { applyFiltersManual, preprocessImageData } from './filters.js';
import { hashCanvasContent } from './utils.js';

/**
 * Check if any preprocessing options are set
 * @deprecated Color adjustments are now done at moduleCount resolution in getOverlayData
 */
export function hasPreprocessingOptions(config) {
  return (
    (config.overlayBrightness && config.overlayBrightness !== 0) ||
    (config.overlayContrast && config.overlayContrast !== 0) ||
    (config.overlayGamma && config.overlayGamma !== 1) ||
    (config.overlaySaturation && config.overlaySaturation !== 0) ||
    (config.overlayHueRotate && config.overlayHueRotate !== 0) ||
    config.invertImage ||
    (config.overlayBlur && config.overlayBlur > 0) ||
    (config.overlaySharpen && config.overlaySharpen > 0) ||
    (config.overlayPosterize && config.overlayPosterize > 0) ||
    (config.overlayEdgeDetect && config.overlayEdgeDetect !== 'off') ||
    (config.overlayThreshold !== undefined && config.overlayThreshold !== 128) ||
    config.overlayFlipX ||
    config.overlayFlipY ||
    (config.overlayRotate && config.overlayRotate !== 0)
  );
}

/**
 * Check if geometric transforms are needed (rotation, flip)
 * These must be done before downscaling as they affect spatial layout
 */
export function hasGeometricTransforms(config) {
  return (
    config.overlayFlipX ||
    config.overlayFlipY ||
    (config.overlayRotate && config.overlayRotate !== 0)
  );
}

/**
 * Apply only geometric transforms (rotation, flip) at full resolution
 * Color adjustments are done at moduleCount resolution in getOverlayData
 */
export async function applyGeometricTransforms(overlayCanvas, config, createCanvasFn) {
  const width = overlayCanvas.width;
  const height = overlayCanvas.height;

  const processedCanvas = await createCanvasFn(width, height);
  const ctx = processedCanvas.getContext('2d');

  ctx.save();

  // Handle rotation
  if (config.overlayRotate && config.overlayRotate !== 0) {
    ctx.translate(width / 2, height / 2);
    ctx.rotate((config.overlayRotate * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);
  }

  // Handle flips
  if (config.overlayFlipX || config.overlayFlipY) {
    ctx.translate(config.overlayFlipX ? width : 0, config.overlayFlipY ? height : 0);
    ctx.scale(config.overlayFlipX ? -1 : 1, config.overlayFlipY ? -1 : 1);
  }

  ctx.drawImage(overlayCanvas, 0, 0);
  ctx.restore();

  return processedCanvas;
}

/**
 * Preprocess overlay canvas with filters and transforms
 */
export async function preprocessOverlay(overlayCanvas, config, createCanvasFn) {
  const width = overlayCanvas.width;
  const height = overlayCanvas.height;

  // Create a new canvas for processing
  const processedCanvas = await createCanvasFn(width, height);
  const ctx = processedCanvas.getContext('2d');

  // Apply geometric transforms first
  ctx.save();

  // Handle rotation
  if (config.overlayRotate && config.overlayRotate !== 0) {
    ctx.translate(width / 2, height / 2);
    ctx.rotate((config.overlayRotate * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);
  }

  // Handle flips
  if (config.overlayFlipX || config.overlayFlipY) {
    ctx.translate(config.overlayFlipX ? width : 0, config.overlayFlipY ? height : 0);
    ctx.scale(config.overlayFlipX ? -1 : 1, config.overlayFlipY ? -1 : 1);
  }

  ctx.drawImage(overlayCanvas, 0, 0);
  ctx.restore();

  // Get image data for filter processing
  const imageData = ctx.getImageData(0, 0, width, height);

  // Build filter options
  const filterOptions = {
    brightness: config.overlayBrightness || 0,
    contrast: config.overlayContrast || 0,
    gamma: config.overlayGamma || 1,
    saturation: config.overlaySaturation || 0,
    hueRotate: config.overlayHueRotate || 0,
    invert: config.invertImage,
    blur: config.overlayBlur || 0,
    sharpen: config.overlaySharpen || 0,
    posterize: config.overlayPosterize || 0,
    edgeDetect: config.overlayEdgeDetect || 'off',
  };

  // Only apply threshold if explicitly set and edge detection is off
  if (
    config.overlayThreshold !== undefined &&
    config.overlayThreshold !== 128 &&
    filterOptions.edgeDetect === 'off'
  ) {
    filterOptions.threshold = config.overlayThreshold;
  }

  // Apply filters manually (self-contained implementation)
  applyFiltersManual(imageData, filterOptions);

  // Put processed image data back
  ctx.putImageData(imageData, 0, 0);

  return processedCanvas;
}

/**
 * Get overlay data - async version using canvas factory
 * OPTIMIZED: Preprocessing is now done at moduleCount resolution (not full res)
 * This is 10-50x faster than preprocessing at full resolution.
 */
export async function getOverlayData(
  overlayCanvas,
  moduleCount,
  colorMode,
  invertImage,
  frameIndex,
  config,
  createCanvasFn
) {
  // Create cache key based on canvas identity, content hash, and parameters
  // Include frameIndex to ensure different animation frames aren't cached together
  // Use content hash to disambiguate different images with same dimensions
  const contentHash = await hashCanvasContent(overlayCanvas, createCanvasFn);
  const canvasKey = `${overlayCanvas.width}x${overlayCanvas.height}:${contentHash}`;
  const preprocessKey = `${config.overlayBrightness || 0}:${config.overlayContrast || 0}:${config.overlayGamma || 1}:${config.overlaySaturation || 0}:${config.overlayHueRotate || 0}:${invertImage}:${config.overlayBlur || 0}:${config.overlaySharpen || 0}:${config.overlayPosterize || 0}:${config.overlayThreshold ?? 128}:${config.overlayEdgeDetect || 'off'}`;
  const cacheKey = `${canvasKey}:${moduleCount}:${colorMode}:${preprocessKey}:${frameIndex}`;

  // Check if we have this exact configuration cached
  const cached = overlayDataCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const tempCanvas = await createCanvasFn(moduleCount, moduleCount);
  const ctx = tempCanvas.getContext('2d');

  // STEP 1: Downscale to moduleCount FIRST (this is the key optimization)
  ctx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);

  // STEP 2: Apply preprocessing on the SMALL image (O(moduleCount^2) instead of O(overlay_width*height))
  const imageData = ctx.getImageData(0, 0, moduleCount, moduleCount);
  preprocessImageData(imageData, config, invertImage);
  const data = imageData.data;

  // STEP 3: Extract brightness and color maps
  const brightness = [];
  const colors = [];

  for (let row = 0; row < moduleCount; row++) {
    brightness[row] = [];
    colors[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      const i = (row * moduleCount + col) * 4;
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

  // Cache the result
  overlayDataCache.set(cacheKey, brightness);

  return brightness;
}

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
 * Load image data from canvas as RGB values (0-1 range)
 * Now supports preprocessing via config parameter
 */
export async function loadImageDataRGB(canvas, size, config, createCanvasFn) {
  const tempCanvas = await createCanvasFn(size, size);
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);

  // Apply preprocessing if config is provided
  preprocessImageData(imgData, config, config.invertImage);

  const output = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      row.push({
        r: imgData.data[i] / 255,
        g: imgData.data[i + 1] / 255,
        b: imgData.data[i + 2] / 255,
      });
    }
    output.push(row);
  }
  return output;
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
