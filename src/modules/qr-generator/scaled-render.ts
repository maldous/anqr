/**
 * Scaled QR Rendering
 * Handles all scaled overlay modes (dithered, blue-noise, subpixel)
 */

import { createLogger } from '../../lib/logger';
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

const log = createLogger('GENERATE');

function _isDarkModule(row: number, col: number, moduleCount: number): boolean {
  // Fixed dark module (always dark) per ISO/IEC 18004.
  // For any version, this is at (moduleCount - 8, 8).
  return row === moduleCount - 8 && col === 8;
}

type PixelColor = RGB;

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

  // Calculate micro-pixel size with fractional support for smoother high-density rendering.
  const subPixelSize = Math.max(0.5, config.moduleSize / scale);
  const effectiveModuleSize = subPixelSize * scale;

  // UNIFIED: Apply frame settings
  const frameExtra =
    config.frameStyle && config.frameStyle !== 'none' && config.frameText
      ? effectiveModuleSize * 4
      : 0;
  const marginPx = marginModules * effectiveModuleSize;
  const size = Math.round(scaledSize * subPixelSize + marginPx * 2 + frameExtra);

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
  const forceBinaryFunctionPatterns = isDitheredMode;
  const isSubpixelMode =
    config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  const needsBothDarkAndLightColors = isDitheredMode || isSubpixelMode;

  const debug = config.debugOverlayDither === true;
  if (debug) {
    log.debug('ScaledRender start', {
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

  const adjustLumaPreserveChroma = (
    c: PixelColor,
    targetLuma: number,
    chromaScale: number
  ): { r: number; g: number; b: number } => {
    const gray = (c.r + c.g + c.b) / 3;
    let r = gray + (c.r - gray) * chromaScale;
    let g = gray + (c.g - gray) * chromaScale;
    let b = gray + (c.b - gray) * chromaScale;
    const currentLuma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const delta = (targetLuma - currentLuma) * 255;
    r = Math.max(0, Math.min(255, r + delta));
    g = Math.max(0, Math.min(255, g + delta));
    b = Math.max(0, Math.min(255, b + delta));
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };
  const dotMinRadiusPx = Math.max(0.2, config.dotMinRadiusPx ?? subPixelSize * 0.18);
  const dotMaxRadiusPx = Math.max(dotMinRadiusPx + 0.1, config.dotMaxRadiusPx ?? subPixelSize * 0.58);
  const maxRadiusBound = subPixelSize * 0.5;
  const seed = config.seed ?? 1337;
  const radiusBins = 7;

  const hash01 = (x: number, y: number, s: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453;
    return n - Math.floor(n);
  };

  const quantizeRadius = (r: number): number => {
    const t = Math.max(0, Math.min(1, (r - dotMinRadiusPx) / Math.max(1e-6, dotMaxRadiusPx - dotMinRadiusPx)));
    const q = Math.round(t * (radiusBins - 1)) / Math.max(1, radiusBins - 1);
    return dotMinRadiusPx + q * (dotMaxRadiusPx - dotMinRadiusPx);
  };

  const localVariance = (x: number, y: number): number => {
    const c = colors[y]?.[x] as PixelColor | undefined;
    if (!c) return 0;
    const luma = (p: PixelColor) => (0.299 * p.r + 0.587 * p.g + 0.114 * p.b) / 255;
    const center = luma(c);
    let sum = 0;
    let n = 0;
    const nb = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [ox, oy] of nb) {
      const p = colors[y + oy]?.[x + ox] as PixelColor | undefined;
      if (!p) continue;
      const d = luma(p) - center;
      sum += d * d;
      n++;
    }
    return n > 0 ? Math.min(1, Math.sqrt(sum / n) * 3.0) : 0;
  };

  const drawDitherDot = (x: number, y: number, radius: number, jitterN: number): void => {
    const jitterAmp = subPixelSize * 0.18;
    const jx = (hash01(x, y, seed + 11) - 0.5) * 2 * jitterAmp * jitterN;
    const jy = (hash01(x, y, seed + 29) - 0.5) * 2 * jitterAmp * jitterN;
    ctx.beginPath();
    ctx.arc(
      x + subPixelSize / 2 + jx,
      y + subPixelSize / 2 + jy,
      Math.min(radius, maxRadiusBound),
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

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
        log.debug('ScaledRender samplePixel', {
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
          if (isDitheredMode) {
            const dark = adjustLumaPreserveChroma(color, 0.22, 1.08);
            const darkR = dark.r;
            const darkG = dark.g;
            const darkB = dark.b;
            ctx.fillStyle = `rgb(${darkR},${darkG},${darkB})`;
            const luma = (0.299 * darkR + 0.587 * darkG + 0.114 * darkB) / 255;
            const varN = localVariance(x, y);
            const noiseN = hash01(x, y, seed);
            const rawRadius =
              dotMinRadiusPx +
              (1 - luma) * (dotMaxRadiusPx - dotMinRadiusPx) * (0.78 + 0.34 * varN) +
              (noiseN - 0.5) * (dotMaxRadiusPx - dotMinRadiusPx) * 0.22;
            const radius = quantizeRadius(Math.max(dotMinRadiusPx, rawRadius));
            drawDitherDot(dx, dy, radius, 1.0);
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
            // Ink-only rendering model: keep paper mostly open for highlights.
            // Optional sparse warm/cool paper grain prevents sterile flat whites.
            const n = hash01(x, y, seed + 71);
            if (n > 0.992) {
              const tint = adjustLumaPreserveChroma(color, 0.95, 0.35);
              ctx.fillStyle = `rgba(${tint.r},${tint.g},${tint.b},0.08)`;
              drawDitherDot(dx, dy, dotMinRadiusPx * 0.55, 0.5);
            }
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
  const shouldDrawFindersFirst =
    forceBinaryFunctionPatterns || config.preserveFinders !== false || !overlayCanvas;

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
      if (forceBinaryFunctionPatterns) {
        drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, {
          ...config,
          gradient: { type: 'none', stops: [] },
          fgColor: effectiveFgColor,
          bgColor: effectiveBgColor,
        });
      } else {
        drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, config);
      }
    }
  }

  // UNIFIED: Draw styled alignment patterns (for version 2+)
  // Only draw alignment patterns separately if preserveAlignment is true OR there's no overlay
  // When preserveAlignment=false with overlay, alignment modules were already rendered with overlay effects
  const shouldDrawAlignmentFirst =
    forceBinaryFunctionPatterns || config.preserveAlignment !== false || !overlayCanvas;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
  if (version >= 2 && shouldDrawAlignmentFirst) {
    const alignPositions = getAlignmentPositionsCached(version, moduleCount);
    const alignmentStyle = config.alignmentStyle || 'match_finder';
    for (const pos of alignPositions) {
      // pos.row/col is the CENTER module of the alignment pattern
      // Convert to pixel center position
      const centerX = marginPx + (pos.col + 0.5) * effectiveModuleSize;
      const centerY = marginPx + (pos.row + 0.5) * effectiveModuleSize;
      if (forceBinaryFunctionPatterns) {
        drawAlignmentPattern(ctx, centerX, centerY, effectiveModuleSize, alignmentStyle, {
          ...config,
          gradient: { type: 'none', stops: [] },
          fgColor: effectiveFgColor,
          bgColor: effectiveBgColor,
        });
      } else {
        drawAlignmentPattern(ctx, centerX, centerY, effectiveModuleSize, alignmentStyle, config);
      }
    }
  }

  // Preserve timing pattern modules on top (scan critical)
  // When preserveTiming is false, we intentionally leave timing modules subject to the overlay.
  const shouldPreserveTiming = forceBinaryFunctionPatterns || config.preserveTiming === true;
  if (shouldPreserveTiming) {
    const timingStyle = config.timingStyle || 'match_module';
    // Horizontal timing (row 6, between finders)
    const timingRow = 6;
    for (let col = 8; col < moduleCount - 8; col++) {
      const isDark = qr.isDark(timingRow, col);
      const x = marginPx + col * effectiveModuleSize;
      const y = marginPx + timingRow * effectiveModuleSize;
      if (isDark) {
        ctx.fillStyle = forceBinaryFunctionPatterns
          ? effectiveFgColor
          : useGradient && gradientFill
            ? gradientFill
            : effectiveFgColor;
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
        ctx.fillStyle = forceBinaryFunctionPatterns
          ? effectiveFgColor
          : useGradient && gradientFill
            ? gradientFill
            : effectiveFgColor;
        drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
      } else {
        ctx.fillStyle = effectiveBgColor;
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
      }
    }
  }

  // Preserve format + version info modules on top (scan critical)
  // These are small fixed areas, and should be kept clean when protection is enabled.
  const protectFormat = forceBinaryFunctionPatterns || config.protectFormatInfo === true;
  const protectVersion = forceBinaryFunctionPatterns || config.protectVersionInfo === true;

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
          ctx.fillStyle = forceBinaryFunctionPatterns
            ? effectiveFgColor
            : useGradient && gradientFill
              ? gradientFill
              : effectiveFgColor;
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
      ctx.fillStyle = forceBinaryFunctionPatterns
        ? effectiveFgColor
        : useGradient && gradientFill
          ? gradientFill
          : effectiveFgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }

    if (debug) {
      log.debug('ScaledRender preserved', {
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
