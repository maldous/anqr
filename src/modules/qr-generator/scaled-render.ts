/**
 * Scaled QR Rendering
 * Handles all scaled overlay modes (dithered, blue-noise, subpixel)
 */

import type { CanvasFactory } from './canvas-factory';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
} from './drawing';
import { getAlignmentPositionsCached } from './pattern-helpers';
import { generatePixelDecisionMatrix } from './pixel-matrix';
import type { QRCodeInstance, QRGeneratorConfig, RGB } from './types';
import { parseColor } from '../core';
import { validateColor } from './utils';

interface PixelColor extends RGB {
  halftone?: boolean;
  sizeRatio?: number;
}

function clamp255(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n;
}

function luma255(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function blendRgb(a: RGB, b: RGB, t: number): RGB {
  const tt = t < 0 ? 0 : t > 1 ? 1 : t;
  return {
    r: Math.round(a.r + (b.r - a.r) * tt),
    g: Math.round(a.g + (b.g - a.g) * tt),
    b: Math.round(a.b + (b.b - a.b) * tt),
  };
}

function rgbStr(rgb: RGB): string {
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

function clampLuminance(rgb: RGB, isDark: boolean): RGB {
  // Keep a strong, scan-friendly contrast while still preserving hue.
  const darkMax = 100;
  const lightMin = 200;

  const y = luma255(rgb.r, rgb.g, rgb.b);
  if (isDark) {
    if (y <= darkMax) return rgb;
    const f = darkMax / (y || 1);
    return { r: Math.round(rgb.r * f), g: Math.round(rgb.g * f), b: Math.round(rgb.b * f) };
  }
  if (y >= lightMin) return rgb;
  if (y <= 0.0001) return { r: lightMin, g: lightMin, b: lightMin };
  const f = lightMin / y;
  return { r: clamp255(rgb.r * f), g: clamp255(rgb.g * f), b: clamp255(rgb.b * f) };
}

/**
 * UNIFIED SCALED QR GENERATION
 * Handles ALL scaled overlay modes (dithered, blue-noise, subpixel, subpixel-size)
 * through a single code path with ALL settings applied uniformly.
 */
export async function generateScaledQR(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  moduleCount: number,
  scale: number,
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>,
  canvasFactory: CanvasFactory,
  storeMatrixFn: (qr: QRCodeInstance, moduleCount: number) => void
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  // Get pixel decision matrix (unified for all scaled modes)
  const pixelData = await generatePixelDecisionMatrix(
    qr,
    config,
    overlayCanvas,
    moduleCount,
    createCanvasFn,
    canvasFactory
  );
  const { matrix, colors } = pixelData;
  const scaledSize = matrix.length;

  // UNIFIED: Apply quietZoneMinEnforce setting
  const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
  const marginModules = Math.max(quietZoneMin, config.margin);

  // Calculate pixel size
  const subPixelSize = Math.max(1, Math.round(config.moduleSize / scale));
  const effectiveModuleSize = subPixelSize * scale;

  // UNIFIED: Apply frame settings
  const frameExtra =
    config.frameStyle && config.frameStyle !== 'none' && config.frameText
      ? effectiveModuleSize * 4
      : 0;
  const marginPx = marginModules * effectiveModuleSize;
  const size = scaledSize * subPixelSize + marginPx * 2 + frameExtra;

  const canvas = await createCanvasFn(size, size);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;

  // IMPORTANT: Ensure bgColor has a fallback - undefined fillStyle becomes black
  // IMPORTANT: Validate colors - invalid fillStyle values cause canvas to use black
  const effectiveBgColor = validateColor(config.bgColor, '#ffffff');
  const effectiveFgColor = validateColor(config.fgColor, '#000000');
  const bgRgb = (() => {
    const c = parseColor(effectiveBgColor);
    return { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) };
  })();
  const fgRgb = (() => {
    const c = parseColor(effectiveFgColor);
    return { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) };
  })();
  const needsExplicitLightModules = config.transparentBg === true;

  const overlayIntensity01 = Math.max(0, Math.min(1, (config.overlayIntensity ?? 100) / 100));
  const overlayAnchorMix = 0.25 + 0.25 * overlayIntensity01;

  // Draw background
  if (!config.transparentBg) {
    ctx.fillStyle = effectiveBgColor;
    ctx.fillRect(0, 0, size, size);
  }

  // Draw frame background (sticker) BEFORE QR modules so it appears behind
  drawFrameBackground(ctx, size, effectiveModuleSize, marginModules, config);

  // UNIFIED: Create gradient fill if configured
  const gradientFill = createGradientFill(ctx, config, size);
  const useGradient = config.gradient && config.gradient.type !== 'none';

  // Determine color rendering mode
  const useColorRendering = !!overlayCanvas && config.colorMode !== 'bw';
  
  // For overlay modes that display the image through colors (dithered, blue-noise, subpixel),
  // BOTH dark and light modules need to show overlay colors.
  // The image emerges from the COLOR CONTRAST in the overlay itself.
  // - Dark modules show darker overlay colors (dark parts of the image)
  // - Light modules show lighter overlay colors (light parts of the image)
  const isDitheredMode =
    config.overlayMode === 'dithered' ||
    config.overlayMode === 'blue-noise' ||
    config.overlayMode === 'blue_noise';
  const isSubpixelMode = config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  const needsBothDarkAndLightColors = isDitheredMode || isSubpixelMode;

  // Targeted debug for overlay dithering only.
  if (config.debugOverlayDither) {
    console.log('[OverlayDither] scaled-render', {
      scaledSize,
      overlayMode: config.overlayMode,
      useColorRendering,
      needsBothDarkAndLightColors,
    });
  }

  // Render all pixels
  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const isDark = matrix[y]?.[x];
      const color = colors[y]?.[x] as PixelColor | undefined;

      // Skip light pixels unless:
      // - Transparent background requires explicit drawing
      // - Dithered/subpixel modes need to draw light pixels with overlay colors
      const shouldDrawLightPixel = needsExplicitLightModules || (needsBothDarkAndLightColors && useColorRendering);
      
      if (!isDark && !shouldDrawLightPixel) continue;

      const dx = marginPx + x * subPixelSize;
      const dy = marginPx + y * subPixelSize;

      if (isDark) {
        // Dark module: use overlay color if available, otherwise foreground color
        if (useColorRendering && color) {
          // Check for halftone rendering flag
          if (color.halftone) {
            // Draw halftone dot
            ctx.fillStyle = effectiveBgColor;
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
            ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
            const dotSize = subPixelSize * (color.sizeRatio || 1);
            const offset = (subPixelSize - dotSize) / 2;
            ctx.fillRect(dx + offset, dy + offset, dotSize, dotSize);
          } else if (isDitheredMode) {
            // Dithered/blue-noise: preserve hue while forcing scan-friendly contrast.
            const base = { r: color.r, g: color.g, b: color.b };
            const mixed = clampLuminance(blendRgb(base, fgRgb, overlayAnchorMix), true);
            ctx.fillStyle = rgbStr(mixed);
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
          } else {
            // For subpixel modes: use raw overlay color
            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
          }
        } else {
          // B&W mode or no color data: use foreground color (with optional gradient)
          ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      } else {
        // Light module: draw with background color or overlay color
        if (needsBothDarkAndLightColors && useColorRendering && color) {
          if (isDitheredMode) {
            // Dithered/blue-noise: preserve hue while forcing scan-friendly contrast.
            const base = { r: color.r, g: color.g, b: color.b };
            const mixed = clampLuminance(blendRgb(base, bgRgb, overlayAnchorMix), false);
            ctx.fillStyle = rgbStr(mixed);
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
          } else {
            // For subpixel modes: use raw overlay color
            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
          }
        } else {
          // Standard: draw with background color
          ctx.fillStyle = effectiveBgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      }
    }
  }

  // UNIFIED: Draw styled finder patterns on top of pixel rendering
  // Only draw finders separately if preserveFinders is true OR there's no overlay
  // When preserveFinders=false with overlay, finder modules were already rendered with overlay effects
  const shouldDrawFindersFirst = config.preserveFinders !== false || !overlayCanvas;

  const finderPositions = [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: moduleCount - 7 }, // Top-right
    { row: moduleCount - 7, col: 0 }, // Bottom-left
  ];

  if (shouldDrawFindersFirst) {
    for (const pos of finderPositions) {
      // Position is in module coordinates, convert to pixels
      const x = marginPx + pos.col * effectiveModuleSize;
      const y = marginPx + pos.row * effectiveModuleSize;
      drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, config);
    }
  }

  // UNIFIED: Draw styled alignment patterns (for version 2+)
  // Only draw alignment patterns separately if preserveAlignment is true OR there's no overlay
  // When preserveAlignment=false with overlay, alignment modules were already rendered with overlay effects
  const shouldDrawAlignmentFirst = config.preserveAlignment !== false || !overlayCanvas;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
  if (version >= 2 && shouldDrawAlignmentFirst) {
    const alignPositions = getAlignmentPositionsCached(version, moduleCount);
    const alignmentStyle = config.alignmentStyle || 'match_finder';
    for (const pos of alignPositions) {
      // pos.row/col is the CENTER module of the alignment pattern
      // Convert to pixel center position
      const centerX = marginPx + (pos.col + 0.5) * effectiveModuleSize;
      const centerY = marginPx + (pos.row + 0.5) * effectiveModuleSize;
      drawAlignmentPattern(ctx, centerX, centerY, effectiveModuleSize, alignmentStyle, config);
    }
  }

  // UNIFIED: Draw frame if configured
  drawFrame(ctx, size, effectiveModuleSize, marginModules, config);

  // Store the QR matrix for vector SVG export
  const syntheticQr: QRCodeInstance = {
    isDark: (row: number, col: number): boolean => {
      const subRow = row * scale + Math.floor(scale / 2);
      const subCol = col * scale + Math.floor(scale / 2);
      return matrix[subRow]?.[subCol] ?? false;
    },
    getModuleCount: () => moduleCount,
    addData: () => {},
    make: () => {},
  };
  storeMatrixFn(syntheticQr, moduleCount);

  return canvas;
}
