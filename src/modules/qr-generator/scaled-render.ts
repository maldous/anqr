/**
 * Scaled QR Rendering
 * Handles all scaled overlay modes (dithered, blue-noise, subpixel)
 */

import { isFormatInfo as isFormatInfoSpec, isVersionInfo as isVersionInfoSpec } from '../qr-spec';
import type { CanvasFactory } from './canvas-factory';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
  drawTimingModule,
} from './drawing';
import { getAlignmentPositionsCached } from './pattern-helpers';
import { generatePixelDecisionMatrix } from './pixel-matrix';
import type { QRCodeInstance, QRGeneratorConfig, RGB } from './types';
import { validateColor } from './utils';

function _isDarkModule(row: number, col: number, moduleCount: number): boolean {
  // Fixed dark module (always dark) per ISO/IEC 18004.
  // For any version, this is at (moduleCount - 8, 8).
  return row === moduleCount - 8 && col === 8;
}

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
  const isDitheredMode =
    config.overlayMode === 'dithered' ||
    config.overlayMode === 'blue_noise' ||
    config.overlayMode === 'blue-noise';
  const isSubpixelMode =
    config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  const needsBothDarkAndLightColors = isDitheredMode || isSubpixelMode;

  const debug = config.debugOverlayDither === true;
  if (debug) {
    console.log('[OverlayDither][ScaledRender] start', {
      moduleCount,
      scale,
      scaledSize,
      overlayMode: config.overlayMode,
      colorMode: config.colorMode,
      useColorRendering,
      needsBothDarkAndLightColors,
      protectFormatInfo: config.protectFormatInfo,
      protectVersionInfo: config.protectVersionInfo,
      preserveFinders: config.preserveFinders,
      preserveTiming: config.preserveTiming,
      preserveAlignment: config.preserveAlignment,
      hasColors: !!(colors?.length && colors[0]?.length),
      sampleColor: colors?.[5]?.[5],
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
      const shouldDrawLightPixel =
        needsExplicitLightModules || (needsBothDarkAndLightColors && useColorRendering);

      if (
        debug &&
        y === Math.floor(scaledSize / 2) &&
        (x === Math.floor(scaledSize / 2) || x === Math.floor(scaledSize / 2) + 4)
      ) {
        console.log('[OverlayDither][ScaledRender] samplePixel', {
          y,
          x,
          isDark,
          color,
        });
      }

      if (!(isDark || shouldDrawLightPixel)) continue;

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

  // Preserve timing pattern modules on top (scan critical)
  // When preserveTiming is false, we intentionally leave timing modules subject to the overlay.
  const shouldPreserveTiming = config.preserveTiming === true;
  if (shouldPreserveTiming) {
    const timingStyle = config.timingStyle || 'match_module';
    // Horizontal timing (row 6, between finders)
    const timingRow = 6;
    for (let col = 8; col < moduleCount - 8; col++) {
      const isDark = qr.isDark(timingRow, col);
      const x = marginPx + col * effectiveModuleSize;
      const y = marginPx + timingRow * effectiveModuleSize;
      if (isDark) {
        ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
        drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
      } else {
        // Override any overlay color for light timing modules
        ctx.fillStyle = effectiveBgColor;
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
      }
    }
    // Vertical timing (col 6, between finders)
    const timingCol = 6;
    for (let row = 8; row < moduleCount - 8; row++) {
      const isDark = qr.isDark(row, timingCol);
      const x = marginPx + timingCol * effectiveModuleSize;
      const y = marginPx + row * effectiveModuleSize;
      if (isDark) {
        ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
        drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
      } else {
        ctx.fillStyle = effectiveBgColor;
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
      }
    }
  }

  // Preserve format + version info modules on top (scan critical)
  // These are small fixed areas, and should be kept clean when protection is enabled.
  const protectFormat = config.protectFormatInfo === true;
  const protectVersion = config.protectVersionInfo === true;

  if (protectFormat || protectVersion) {
    let formatCount = 0;
    let versionCount = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const isFormat = protectFormat && isFormatInfoSpec(row, col, moduleCount);
        const isVersion = protectVersion && isVersionInfoSpec(row, col, moduleCount, version);
        if (!(isFormat || isVersion)) continue;

        const isDark = qr.isDark(row, col);
        const x = marginPx + col * effectiveModuleSize;
        const y = marginPx + row * effectiveModuleSize;

        if (isDark) {
          ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
        } else {
          ctx.fillStyle = effectiveBgColor;
        }
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);

        if (isFormat) formatCount++;
        if (isVersion) versionCount++;
      }
    }

    // Also preserve the fixed dark module (scan critical)
    // Spec location: (moduleCount - 8, 8)
    const dmRow = moduleCount - 8;
    const dmCol = 8;
    if (dmRow >= 0 && dmRow < moduleCount && dmCol >= 0 && dmCol < moduleCount) {
      const x = marginPx + dmCol * effectiveModuleSize;
      const y = marginPx + dmRow * effectiveModuleSize;
      ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }

    if (debug) {
      console.log('[OverlayDither][ScaledRender] preserved', {
        protectFormat,
        protectVersion,
        formatCount,
        versionCount,
        preservedTiming: shouldPreserveTiming,
      });
    }
  }

  // UNIFIED: Draw frame if configured
  drawFrame(ctx, size, effectiveModuleSize, marginModules, config);

  // Store the QR matrix for vector SVG export
  // Export should reflect the canonical QR modules, not the scaled pixel decision matrix.
  // The pixel matrix is used for rendering effects (dither/subpixel) and can introduce
  // ambiguity when collapsed back to module resolution.
  storeMatrixFn(qr, moduleCount);

  return canvas;
}
