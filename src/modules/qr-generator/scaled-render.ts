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
import { validateColor } from './utils';

interface PixelColor extends RGB {
  halftone?: boolean;
  sizeRatio?: number;
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
  const needsExplicitLightModules = config.transparentBg === true;

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
  const useColorRendering = overlayCanvas && config.colorMode !== 'bw';
  
  // For overlay modes that display the image through colors (dithered, blue-noise, subpixel),
  // BOTH dark and light modules need to show overlay colors.
  // The image emerges from the COLOR CONTRAST in the overlay itself.
  // - Dark modules show darker overlay colors (dark parts of the image)
  // - Light modules show lighter overlay colors (light parts of the image)
  const isDitheredMode = config.overlayMode === 'dithered' || config.overlayMode === 'blue_noise';
  const isSubpixelMode = config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  const needsBothDarkAndLightColors = isDitheredMode || isSubpixelMode;

  // TRACE: Log rendering configuration
  console.log('[ScaledRender] TRACE: Rendering started', {
    scaledSize,
    overlayMode: config.overlayMode,
    useColorRendering,
    isDitheredMode,
    isSubpixelMode,
    needsBothDarkAndLightColors,
    hasColors: colors && colors.length > 0 && colors[0]?.length > 0,
    sampleColor: colors[5]?.[5],
  });

  // Render all pixels
  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const isDark = matrix[y]?.[x];
      const color = colors[y]?.[x] as PixelColor | undefined;

      // Skip light pixels unless:
      // - Transparent background requires explicit drawing
      // - Dithered/subpixel modes need to draw light pixels with overlay colors
      const shouldDrawLightPixel = needsExplicitLightModules || (needsBothDarkAndLightColors && useColorRendering);
      
      // TRACE: Log pixels from DATA area to verify dark/light contrast is being applied
      // Log one dark pixel and one light pixel to show both are being processed with correct colors
      if ((y === 60 && x === 60) || (y === 60 && x === 64) || (y === 50 && x === 50) || (y === 50 && x === 54)) {
        const renderedColor = isDark && color && isDitheredMode
          ? `rgb(${Math.round(color.r * 0.15)},${Math.round(color.g * 0.15)},${Math.round(color.b * 0.15)})`
          : !isDark && color && isDitheredMode
            ? `rgb(${Math.round(color.r + (255 - color.r) * 0.85)},${Math.round(color.g + (255 - color.g) * 0.85)},${Math.round(color.b + (255 - color.b) * 0.85)})`
            : 'N/A';
        console.log(`[ScaledRender] TRACE: Pixel[${y}][${x}]`, {
          isDark,
          originalColor: color ? `rgb(${color.r},${color.g},${color.b})` : 'null',
          renderedColor,
          isDitheredMode,
          useColorRendering,
        });
      }
      
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
            // For dithered/blue-noise modes: DARKEN the overlay color for dark modules
            // This creates visual contrast between dark and light modules while preserving image colors
            // Dark modules use strongly darkened overlay color (multiply by ~0.15 for high contrast)
            const darkR = Math.round(color.r * 0.15);
            const darkG = Math.round(color.g * 0.15);
            const darkB = Math.round(color.b * 0.15);
            ctx.fillStyle = `rgb(${darkR},${darkG},${darkB})`;
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
            // For dithered/blue-noise modes: LIGHTEN the overlay color for light modules
            // This creates visual contrast between dark and light modules while preserving image colors
            // Light modules use strongly lightened overlay color (blend toward white by ~85% for high contrast)
            const lightR = Math.round(color.r + (255 - color.r) * 0.85);
            const lightG = Math.round(color.g + (255 - color.g) * 0.85);
            const lightB = Math.round(color.b + (255 - color.b) * 0.85);
            ctx.fillStyle = `rgb(${lightR},${lightG},${lightB})`;
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
