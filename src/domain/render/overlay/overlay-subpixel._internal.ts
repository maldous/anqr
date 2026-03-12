import { createLogger } from '../../../infra/logging/logger';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../../qr/spec/qr-patterns';
import type { QRCodeObject } from '../../../modules/qr-generator/cache';
import type { QRGeneratorConfig, RGBWithMeta } from '../../../modules/qr-generator/types';

export const log = createLogger('GENERATE');

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

export function isFinderSeparator(row: number, col: number, moduleCount: number): boolean {
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

export interface SubpixelCellCtx {
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

export function resolveOverlayColor(
  overlayColor: { r: number; g: number; b: number } | undefined,
  neutralColor: { r: number; g: number; b: number } | null
): RGBWithMeta | null {
  if (overlayColor) return { ...overlayColor };
  if (neutralColor) return { ...neutralColor };
  return null;
}

export function resolveHalftoneColor(
  overlayColor: { r: number; g: number; b: number } | undefined,
  neutralColor: { r: number; g: number; b: number } | null,
  overlayBrightness: number
): RGBWithMeta | null {
  const sizeRatio = 0.5 + overlayBrightness * 0.5;
  if (overlayColor) return { ...overlayColor, halftone: true, sizeRatio };
  if (neutralColor) return { ...neutralColor, halftone: true, sizeRatio };
  return null;
}

export function processSubpixelCell(
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

export { parseGridSize, parseHexColor, shouldLockModule };
