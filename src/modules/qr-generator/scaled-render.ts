/**
 * Scaled QR Rendering
 * Handles all scaled overlay modes (dithered, blue-noise, subpixel)
 */

import {
  createGradientFill,
  drawAlignmentPattern,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
} from './drawing';
import { getAlignmentPositions } from './pattern-helpers';
import { generatePixelDecisionMatrix } from './pixel-matrix';
import type { CanvasFactory } from './canvas-factory';
import type { QRGeneratorConfig, QRCodeInstance, RGB } from './types';

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

  // Draw background
  if (!config.transparentBg) {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  // Draw frame background (sticker) BEFORE QR modules so it appears behind
  drawFrameBackground(ctx, size, effectiveModuleSize, marginModules, config);

  // UNIFIED: Create gradient fill if configured
  const gradientFill = createGradientFill(ctx, config, size);
  const useGradient = config.gradient && config.gradient.type !== 'none';

  // Determine color rendering mode
  const useColorRendering = overlayCanvas && config.colorMode !== 'bw';

  // Render all pixels
  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const isDark = matrix[y]?.[x];
      const color = colors[y]?.[x] as PixelColor | undefined;

      // Skip light pixels unless doing color rendering
      if (!(isDark || useColorRendering)) continue;

      const dx = marginPx + x * subPixelSize;
      const dy = marginPx + y * subPixelSize;

      if (useColorRendering && color) {
        // Check for halftone rendering flag
        if (color.halftone && isDark) {
          // Draw halftone dot
          ctx.fillStyle = config.bgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
          ctx.fillStyle = useGradient && gradientFill ? gradientFill : config.fgColor;
          const dotSize = subPixelSize * (color.sizeRatio || 1);
          const offset = (subPixelSize - dotSize) / 2;
          ctx.fillRect(dx + offset, dy + offset, dotSize, dotSize);
        } else {
          // Use the actual color from pixel data
          ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      } else if (isDark) {
        // B&W mode: use foreground color (with optional gradient)
        ctx.fillStyle = useGradient && gradientFill ? gradientFill : config.fgColor;
        ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
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
  // Note: moduleCount is the base QR module count (not scaled)
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
  if (version >= 2) {
    const alignPositions = getAlignmentPositions(version, moduleCount);
    const alignmentStyle = config.alignmentStyle || 'match_finder';
    for (const pos of alignPositions) {
      // pos.row/col is the CENTER module of the alignment pattern
      // Convert to pixel center position
      const centerX = marginPx + (pos.col + 0.5) * effectiveModuleSize;
      const centerY = marginPx + (pos.row + 0.5) * effectiveModuleSize;
      drawAlignmentPattern(
        ctx,
        centerX,
        centerY,
        effectiveModuleSize,
        alignmentStyle,
        config
      );
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
