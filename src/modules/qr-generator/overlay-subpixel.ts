/**
 * QR Generator Subpixel Overlay
 * Subpixel rendering for high-quality overlay integration
 */

import { createLogger } from '../../lib/logger';
import { rgbToGray } from '../core';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../qr-spec/qr-patterns';
import type { QRCodeObject } from './cache';
import { curveIntensity } from './pixel-matrix-utils';
import type { CreateCanvasFn, PixelDecisionMatrix, QRGeneratorConfig, RGBWithMeta } from './types';

const log = createLogger('GENERATE');

/**
 * Parse subpixelGridSize string to get scale factor
 * '2x2' -> 2, '3x3' -> 3, '4x4' -> 4
 */
function parseGridSize(gridSize: string | undefined): number {
  if (!gridSize) return 3; // default
  const match = /^(\d+)x\d+$/.exec(gridSize);
  if (match) {
    return Number.parseInt(match[1], 10);
  }
  return 3; // default fallback
}

/**
 * Parse hex color to RGB
 */
function parseHexColor(hex: string | undefined): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (match) {
    return {
      r: Number.parseInt(match[1], 16),
      g: Number.parseInt(match[2], 16),
      b: Number.parseInt(match[3], 16),
    };
  }
  return null;
}

function isFinderSeparator(row: number, col: number, moduleCount: number): boolean {
  return (
    (row === 7 && col <= 7) ||
    (col === 7 && row <= 7) ||
    (row === 7 && col >= moduleCount - 8) ||
    (col === moduleCount - 8 && row <= 7) ||
    (row === moduleCount - 8 && col <= 7) ||
    (col === 7 && row >= moduleCount - 8)
  );
}

/**
 * Check if a module should remain lock-protected based on preservation settings.
 */
function shouldLockModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig
): boolean {
  const preserveFunctional = config.preserveFunctionalPatterns === true;
  const preserveFinders = config.preserveFinders !== false;
  const preserveTiming = preserveFunctional
    ? config.preserveTiming !== false
    : config.preserveTiming === true;
  const preserveAlignment = preserveFunctional
    ? config.preserveAlignment !== false
    : config.preserveAlignment === true;
  const protectFormat = preserveFunctional
    ? config.protectFormatInfo !== false
    : config.protectFormatInfo === true;
  const protectVersion = preserveFunctional
    ? config.protectVersionInfo !== false
    : config.protectVersionInfo === true;
  const preserveFixedDark = preserveFunctional;

  if (row === moduleCount - 8 && col === 8) return preserveFixedDark;
  if (isFinderPattern(row, col, moduleCount) || isFinderSeparator(row, col, moduleCount)) {
    return preserveFinders;
  }
  if (isTimingPattern(row, col, moduleCount)) return preserveTiming;
  if (isAlignmentPattern(row, col, moduleCount, version)) return preserveAlignment;
  if (isFormatInfo(row, col, moduleCount)) return protectFormat;
  if (isVersionInfo(row, col, moduleCount, version)) return protectVersion;
  return false;
}

/**
 * Generate subpixel matrix for overlay modes
 */
export async function getSubpixelOverlayData(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  _config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<{ brightness: number[][]; colors: { r: number; g: number; b: number }[][] }> {
  const scaledSize = moduleCount * scale;

  // Scale overlay to subpixel size
  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) {
    return { brightness: [], colors: [] };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);

  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const brightness: number[][] = [];
  const colors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    brightness[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      brightness[y][x] = rgbToGray(r, g, b) / 255;
      colors[y][x] = { r, g, b };
    }
  }

  return { brightness, colors };
}

interface SubpixelCellCtx {
  qr: QRCodeObject;
  config: QRGeneratorConfig;
  brightness: number[][];
  colors: { r: number; g: number; b: number }[][];
  actualScale: number;
  centerIdx: number;
  neutralColor: { r: number; g: number; b: number } | null;
  useHalftone: boolean;
  finderOverride: string;
  moduleCount: number;
  version: number;
  intensity: number;
}

function resolveOverlayColor(
  overlayColor: { r: number; g: number; b: number } | undefined,
  neutralColor: { r: number; g: number; b: number } | null
): RGBWithMeta | null {
  if (overlayColor) return { ...overlayColor };
  if (neutralColor) return { ...neutralColor };
  return null;
}

function resolveHalftoneColor(
  overlayColor: { r: number; g: number; b: number } | undefined,
  neutralColor: { r: number; g: number; b: number } | null,
  overlayBrightness: number
): RGBWithMeta | null {
  const sizeRatio = 0.5 + overlayBrightness * 0.5;
  if (overlayColor) return { ...overlayColor, halftone: true, sizeRatio };
  if (neutralColor) return { ...neutralColor, halftone: true, sizeRatio };
  return null;
}

function processSubpixelCell(
  ctx: SubpixelCellCtx,
  x: number,
  y: number,
  matrix: boolean[][],
  colorMatrix: (RGBWithMeta | null)[][]
): void {
  const moduleRow = Math.floor(y / ctx.actualScale);
  const moduleCol = Math.floor(x / ctx.actualScale);
  const subX = x % ctx.actualScale;
  const subY = y % ctx.actualScale;
  const isCenter = subX === ctx.centerIdx && subY === ctx.centerIdx;

  const qrValue = ctx.qr.isDark(moduleRow, moduleCol);
  const overlayBrightness = ctx.brightness[y]?.[x] ?? 0.5;
  const overlayColor = ctx.colors[y]?.[x];

  const lockModule = shouldLockModule(
    moduleRow,
    moduleCol,
    ctx.moduleCount,
    ctx.version,
    ctx.config
  );
  const isFinderModule =
    isFinderPattern(moduleRow, moduleCol, ctx.moduleCount) ||
    isFinderSeparator(moduleRow, moduleCol, ctx.moduleCount);
  const forceSolidFinder = ctx.finderOverride === 'solid' && isFinderModule && lockModule;

  if (lockModule || forceSolidFinder) {
    matrix[y][x] = qrValue;
    colorMatrix[y][x] = null;
    return;
  }

  if (isCenter) {
    matrix[y][x] = qrValue;
    colorMatrix[y][x] =
      ctx.useHalftone && qrValue
        ? resolveHalftoneColor(overlayColor, ctx.neutralColor, overlayBrightness)
        : resolveOverlayColor(overlayColor, ctx.neutralColor);
    return;
  }

  const threshold = 0.5 - ctx.intensity * 0.3;
  matrix[y][x] = overlayBrightness < threshold;
  colorMatrix[y][x] = resolveOverlayColor(overlayColor, ctx.neutralColor);
}

/**
 * Generate subpixel matrix
 */
export async function generateSubpixelMatrix(
  qr: QRCodeObject,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  useHalftoneCenter: boolean,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  const gridScale = parseGridSize(config.subpixelGridSize) || scale;
  const actualScale = gridScale;
  const scaledSize = moduleCount * actualScale;
  const intensity = curveIntensity(config.overlayIntensity ?? 100);

  const { brightness, colors } = await getSubpixelOverlayData(
    overlayCanvas,
    moduleCount,
    actualScale,
    config,
    createCanvasFn
  );

  const matrix: boolean[][] = [];
  const colorMatrix: (RGBWithMeta | null)[][] = [];

  const centerIdx = Math.floor(actualScale / 2);
  const neutralColor = parseHexColor(config.subpixelNeutralColor);
  const centerRule = config.subpixelCenterRule || 'strict';
  const useHalftone = centerRule === 'halftone_center' || useHalftoneCenter;
  const finderOverride = config.subpixelFinderOverride || 'solid';
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  log.debug('Subpixel matrix generation', {
    gridScale,
    actualScale,
    scaledSize,
    intensity,
    centerRule,
    finderOverride,
    hasNeutralColor: !!neutralColor,
  });

  const cellCtx: SubpixelCellCtx = {
    qr,
    config,
    brightness,
    colors,
    actualScale,
    centerIdx,
    neutralColor,
    useHalftone,
    finderOverride,
    moduleCount,
    version,
    intensity,
  };

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colorMatrix[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      processSubpixelCell(cellCtx, x, y, matrix, colorMatrix);
    }
  }

  return {
    matrix,
    colors: colorMatrix,
    scale: actualScale,
    overlayData: null,
    effectiveIntensity: intensity * 100,
  };
}
