/**
 * Scaled QR Rendering
 * Handles all scaled overlay modes (dithered, blue-noise, subpixel)
 */

import { createLogger } from '../../lib/logger';
import { parseColor } from '../core';
import {
  isAlignmentPattern as isAlignmentPatternSpec,
  isFinderPattern as isFinderPatternSpec,
  isFormatInfo as isFormatInfoSpec,
  isTimingPattern as isTimingPatternSpec,
  isVersionInfo as isVersionInfoSpec,
} from '../qr-spec';
import type { CanvasFactory } from './canvas-factory';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
  drawModule,
  drawTimingModule,
} from './drawing';
import { getAlignmentPositionsCached } from './pattern-helpers';
import { generatePixelDecisionMatrix } from './pixel-matrix';
import { curveIntensity } from './pixel-matrix-utils';
import type { QRCodeInstance, QRGeneratorConfig, RGB } from './types';
import { validateColor } from './utils';

const log = createLogger('GENERATE');
const PATTERN_FINDER = 1;
const PATTERN_FINDER_SEPARATOR = 2;
const PATTERN_TIMING = 4;
const PATTERN_ALIGNMENT = 8;
const PATTERN_FORMAT = 16;
const PATTERN_VERSION = 32;
const PATTERN_FIXED_DARK = 64;

function isFinderRegionFlag(flags: number): boolean {
  return (flags & (PATTERN_FINDER | PATTERN_FINDER_SEPARATOR)) !== 0;
}

function hash01(x: number, y: number, s: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function adjustLumaPreserveChroma(
  c: PixelColor,
  targetLuma: number,
  chromaScale: number
): { r: number; g: number; b: number } {
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
}
const scaledFunctionalMapCache = new Map<string, Uint8Array>();

interface BlendPreservationCtx {
  ctx: CanvasRenderingContext2D;
  size: number;
  marginPx: number;
  effectiveModuleSize: number;
  subPixelSize: number;
  scaledSize: number;
  moduleCount: number;
  finderStrengthN: number;
  blendPreservationMode: 'dither' | 'overlay';
  isDitheredMode: boolean;
  qr: { isDark(row: number, col: number): boolean };
  colors: (RGB | null)[][];
  getBlendTarget: (
    mRow: number,
    mCol: number,
    sRow: number,
    sCol: number
  ) => { r: number; g: number; b: number };
  sampleModuleColor: (row: number, col: number) => RGB | null;
  estimatePaperLuma: (sampled: RGB | null) => number;
  blendChannelToward: (src: number, target: number, t: number) => number;
}

function computeInkCoverage(
  bctx: BlendPreservationCtx,
  paperLuma: number,
  pixelLuma: number,
  moduleDark: boolean
): number {
  const rawInkContrast = paperLuma - pixelLuma;
  if (!(bctx.blendPreservationMode === 'dither' && bctx.isDitheredMode)) return 1;
  return moduleDark
    ? Math.max(0, Math.min(1, (rawInkContrast - 0.015) / 0.28))
    : Math.max(0, Math.min(1, (rawInkContrast + 0.03) / 0.22));
}

function blendModulePixels(
  bctx: BlendPreservationCtx,
  data: Uint8ClampedArray,
  row: number,
  col: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): void {
  const moduleDark = bctx.qr.isDark(row, col);
  for (let py = y0; py < y1; py++) {
    let idx = (py * bctx.size + x0) * 4;
    const scaledRow = Math.max(
      0,
      Math.min(
        bctx.scaledSize - 1,
        Math.floor((py - bctx.marginPx) / Math.max(1e-6, bctx.subPixelSize))
      )
    );
    for (let px = x0; px < x1; px++) {
      const scaledCol = Math.max(
        0,
        Math.min(
          bctx.scaledSize - 1,
          Math.floor((px - bctx.marginPx) / Math.max(1e-6, bctx.subPixelSize))
        )
      );
      const sampled = bctx.colors[scaledRow]?.[scaledCol] ?? bctx.sampleModuleColor(row, col);
      const paperLuma = bctx.estimatePaperLuma(sampled ?? null);
      const pixelLuma = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
      const inkCoverageN = computeInkCoverage(bctx, paperLuma, pixelLuma, moduleDark);
      if (inkCoverageN <= 1e-3) {
        idx += 4;
        continue;
      }
      const target = bctx.getBlendTarget(row, col, scaledRow, scaledCol);
      const t = bctx.finderStrengthN * inkCoverageN;
      data[idx] = bctx.blendChannelToward(data[idx], target.r, t);
      data[idx + 1] = bctx.blendChannelToward(data[idx + 1], target.g, t);
      data[idx + 2] = bctx.blendChannelToward(data[idx + 2], target.b, t);
      idx += 4;
    }
  }
}

function blendPreservationPass(
  bctx: BlendPreservationCtx,
  boostedModules: Array<{ row: number; col: number }>
): void {
  const imageData = bctx.ctx.getImageData(0, 0, bctx.size, bctx.size);
  const data = imageData.data;
  for (const { row, col } of boostedModules) {
    const x = bctx.marginPx + col * bctx.effectiveModuleSize;
    const y = bctx.marginPx + row * bctx.effectiveModuleSize;
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(bctx.size, Math.ceil(x + bctx.effectiveModuleSize));
    const y1 = Math.min(bctx.size, Math.ceil(y + bctx.effectiveModuleSize));
    blendModulePixels(bctx, data, row, col, x0, y0, x1, y1);
  }
  bctx.ctx.putImageData(imageData, 0, 0);
}

function _isDarkModule(row: number, col: number, moduleCount: number): boolean {
  // Fixed dark module (always dark) per ISO/IEC 18004.
  // For any version, this is at (moduleCount - 8, 8).
  return row === moduleCount - 8 && col === 8;
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

function classifyScaledModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): number {
  let flags = 0;
  if (isFinderPatternSpec(row, col, moduleCount)) flags |= PATTERN_FINDER;
  if (isFinderSeparator(row, col, moduleCount)) flags |= PATTERN_FINDER_SEPARATOR;
  if (isTimingPatternSpec(row, col, moduleCount)) flags |= PATTERN_TIMING;
  if (isAlignmentPatternSpec(row, col, moduleCount, version)) flags |= PATTERN_ALIGNMENT;
  if (isFormatInfoSpec(row, col, moduleCount)) flags |= PATTERN_FORMAT;
  if (isVersionInfoSpec(row, col, moduleCount, version)) flags |= PATTERN_VERSION;
  if (_isDarkModule(row, col, moduleCount)) flags |= PATTERN_FIXED_DARK;
  return flags;
}

function buildScaledFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const map = new Uint8Array(moduleCount * moduleCount);
  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;
    for (let col = 0; col < moduleCount; col++) {
      map[rowBase + col] = classifyScaledModule(row, col, moduleCount, version);
    }
  }
  return map;
}

function getScaledFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const key = `${moduleCount}:${version}`;
  const cached = scaledFunctionalMapCache.get(key);
  if (cached) return cached;
  const map = buildScaledFunctionalMap(moduleCount, version);
  scaledFunctionalMapCache.set(key, map);
  if (scaledFunctionalMapCache.size > 24) {
    const oldestKey = scaledFunctionalMapCache.keys().next().value;
    if (oldestKey !== undefined) scaledFunctionalMapCache.delete(oldestKey);
  }
  return map;
}

type PixelColor = RGB;
interface ShapeMaskCtx {
  ctx: CanvasRenderingContext2D;
  size: number;
  marginPx: number;
  moduleCount: number;
  effectiveModuleSize: number;
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  effectiveBgColor: string;
  getPatternFlags: (row: number, col: number) => number;
  createCanvasFn: (w: number, h: number) => Promise<HTMLCanvasElement | OffscreenCanvas>;
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
}

function isStructuralPatternModule(flags: number): boolean {
  return (
    isFinderRegionFlag(flags) ||
    (flags & PATTERN_ALIGNMENT) !== 0 ||
    (flags & PATTERN_TIMING) !== 0 ||
    (flags & PATTERN_FORMAT) !== 0 ||
    (flags & PATTERN_VERSION) !== 0 ||
    (flags & PATTERN_FIXED_DARK) !== 0
  );
}

function drawShapeMaskModule(
  maskCtx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  effectiveModuleSize: number,
  config: QRGeneratorConfig,
  moduleStyleName: string,
  cornerRadius: number,
  dotRotation: number
): void {
  let gap = config.moduleGap ? (effectiveModuleSize * config.moduleGap) / 100 : 0;
  const gapMode = config.gapMode || 'none';
  if (gapMode === 'inset') gap = Math.max(gap, effectiveModuleSize * 0.1);
  else if (gapMode === 'negative_space') gap = Math.max(gap, effectiveModuleSize * 0.2);
  const adjustedSize = effectiveModuleSize - gap;
  const offset = (effectiveModuleSize - adjustedSize) / 2;

  maskCtx.fillStyle = 'white';
  drawModule(maskCtx, mx + offset, my + offset, adjustedSize, moduleStyleName, {
    cornerRadius,
    rotation: dotRotation,
  });
}

async function applyModuleShapeMask(smctx: ShapeMaskCtx): Promise<void> {
  const {
    ctx,
    size,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    qr,
    config,
    effectiveBgColor,
    getPatternFlags,
    createCanvasFn,
    releaseCanvasFn,
  } = smctx;
  const moduleStyleName = config.moduleStyle || 'square';
  if (moduleStyleName === 'square' || moduleStyleName === 'connected') return;

  const maskCanvas = await createCanvasFn(size, size);
  const maskCtx = maskCanvas.getContext('2d') as CanvasRenderingContext2D;
  maskCtx.imageSmoothingEnabled = false;

  maskCtx.fillStyle = 'white';
  maskCtx.fillRect(0, 0, size, marginPx);
  maskCtx.fillRect(0, marginPx, marginPx, size - marginPx);
  const qrRight = marginPx + moduleCount * effectiveModuleSize;
  maskCtx.fillRect(qrRight, 0, Math.max(0, size - qrRight), size);
  maskCtx.fillRect(0, marginPx + moduleCount * effectiveModuleSize, size, size);

  const cornerRadius = config.cornerRadius || 0;
  const dotRotation = config.dotRotationDeg || 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const mx = marginPx + col * effectiveModuleSize;
      const my = marginPx + row * effectiveModuleSize;

      if (isStructuralPatternModule(getPatternFlags(row, col)) || !qr.isDark(row, col)) {
        maskCtx.fillStyle = 'white';
        maskCtx.fillRect(mx, my, effectiveModuleSize, effectiveModuleSize);
        continue;
      }

      drawShapeMaskModule(
        maskCtx,
        mx,
        my,
        effectiveModuleSize,
        config,
        moduleStyleName,
        cornerRadius,
        dotRotation
      );
    }
  }

  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas as CanvasImageSource, 0, 0);

  ctx.globalCompositeOperation = 'destination-over';
  if (!config.transparentBg) {
    ctx.fillStyle = effectiveBgColor;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.globalCompositeOperation = 'source-over';
  if (releaseCanvasFn) releaseCanvasFn(maskCanvas);
}

interface StructuralPreservationCtx {
  ctx: CanvasRenderingContext2D;
  marginPx: number;
  moduleCount: number;
  effectiveModuleSize: number;
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  version: number;
  forceBinaryFunctionPatterns: boolean;
  preserveFinders: boolean;
  preserveTiming: boolean;
  preserveAlignment: boolean;
  protectFormat: boolean;
  protectVersion: boolean;
  effectiveFgColor: string;
  effectiveBgColor: string;
  useGradient: boolean;
  gradientFill: string | CanvasGradient | null;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  getPatternFlags: (row: number, col: number) => number;
  debug: boolean;
}

function resolveDarkFillStyle(
  forceBinary: boolean,
  effectiveFgColor: string,
  useGradient: boolean,
  gradientFill: string | CanvasGradient | null
): string | CanvasGradient {
  if (forceBinary) return effectiveFgColor;
  return useGradient && gradientFill ? gradientFill : effectiveFgColor;
}

function preserveTimingModules(spctx: StructuralPreservationCtx): void {
  const {
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    qr,
    config,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor,
    useGradient,
    gradientFill,
  } = spctx;
  const timingStyle = config.timingStyle || 'match_module';
  const darkFill = resolveDarkFillStyle(
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    useGradient,
    gradientFill
  );
  // Horizontal timing (row 6, between finders)
  const timingRow = 6;
  for (let col = 8; col < moduleCount - 8; col++) {
    const isDark = qr.isDark(timingRow, col);
    const x = marginPx + col * effectiveModuleSize;
    const y = marginPx + timingRow * effectiveModuleSize;
    if (isDark) {
      ctx.fillStyle = darkFill;
      drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
    } else {
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
      ctx.fillStyle = darkFill;
      drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
    } else {
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }
  }
}

function classifyFormatVersionModule(
  flags: number,
  shouldProtectFormat: boolean,
  shouldProtectVersion: boolean
): { isFormat: boolean; isVersion: boolean } {
  const isFormat = shouldProtectFormat && (flags & PATTERN_FORMAT) !== 0;
  const isVersion = shouldProtectVersion && (flags & PATTERN_VERSION) !== 0;
  return { isFormat, isVersion };
}

function preserveFixedDarkModule(
  ctx: CanvasRenderingContext2D,
  marginPx: number,
  moduleCount: number,
  effectiveModuleSize: number,
  darkFill: string | CanvasGradient
): void {
  const dmRow = moduleCount - 8;
  const dmCol = 8;
  if (dmRow >= 0 && dmRow < moduleCount && dmCol >= 0 && dmCol < moduleCount) {
    const x = marginPx + dmCol * effectiveModuleSize;
    const y = marginPx + dmRow * effectiveModuleSize;
    ctx.fillStyle = darkFill;
    ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
  }
}

function paintClassifiedModule(
  ctx: CanvasRenderingContext2D,
  flags: number,
  isDark: boolean,
  x: number,
  y: number,
  moduleSize: number,
  darkFill: string | CanvasGradient,
  bgColor: string,
  shouldProtectFormat: boolean,
  shouldProtectVersion: boolean
): { formatHit: boolean; versionHit: boolean } {
  const { isFormat, isVersion } = classifyFormatVersionModule(
    flags,
    shouldProtectFormat,
    shouldProtectVersion
  );
  if (!isFormat && !isVersion) return { formatHit: false, versionHit: false };

  ctx.fillStyle = isDark ? darkFill : bgColor;
  ctx.fillRect(x, y, moduleSize, moduleSize);

  return { formatHit: isFormat, versionHit: isVersion };
}

function preserveFormatVersionModules(spctx: StructuralPreservationCtx): void {
  const {
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    qr,
    forceBinaryFunctionPatterns,
    protectFormat,
    protectVersion,
    effectiveFgColor,
    effectiveBgColor,
    useGradient,
    gradientFill,
    getPatternFlags,
    debug,
    preserveTiming,
  } = spctx;
  const shouldProtectFormatInfo = !forceBinaryFunctionPatterns && protectFormat;
  const shouldProtectVersionInfo = !forceBinaryFunctionPatterns && protectVersion;
  if (!shouldProtectFormatInfo && !shouldProtectVersionInfo) return;

  const darkFill = resolveDarkFillStyle(
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    useGradient,
    gradientFill
  );
  let formatCount = 0;
  let versionCount = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const result = paintClassifiedModule(
        ctx,
        getPatternFlags(row, col),
        qr.isDark(row, col),
        marginPx + col * effectiveModuleSize,
        marginPx + row * effectiveModuleSize,
        effectiveModuleSize,
        darkFill,
        effectiveBgColor,
        shouldProtectFormatInfo,
        shouldProtectVersionInfo
      );
      if (result.formatHit) formatCount++;
      if (result.versionHit) versionCount++;
    }
  }

  preserveFixedDarkModule(ctx, marginPx, moduleCount, effectiveModuleSize, darkFill);

  if (debug) {
    log.debug('ScaledRender preserved', {
      protectFormat: shouldProtectFormatInfo,
      protectVersion: shouldProtectVersionInfo,
      formatCount,
      versionCount,
      preservedTiming: !forceBinaryFunctionPatterns && preserveTiming,
    });
  }
}

function resolveBinaryConfig(
  config: QRGeneratorConfig,
  forceBinary: boolean,
  effectiveFgColor: string,
  effectiveBgColor: string
): QRGeneratorConfig {
  if (!forceBinary) return config;
  return {
    ...config,
    gradient: { type: 'none', stops: [] },
    fgColor: effectiveFgColor,
    bgColor: effectiveBgColor,
  };
}

function drawPreservedFinderPatterns(spctx: StructuralPreservationCtx): void {
  const {
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    config,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor,
    overlayCanvas,
  } = spctx;
  if (forceBinaryFunctionPatterns || (config.preserveFinders === false && overlayCanvas)) return;

  const resolvedConfig = resolveBinaryConfig(
    config,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor
  );
  const finderPositions = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ];
  for (const pos of finderPositions) {
    const x = marginPx + pos.col * effectiveModuleSize;
    const y = marginPx + pos.row * effectiveModuleSize;
    drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, resolvedConfig);
  }
}

function drawPreservedAlignmentPatterns(spctx: StructuralPreservationCtx): void {
  const {
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    config,
    version,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor,
    overlayCanvas,
  } = spctx;
  if (forceBinaryFunctionPatterns || version < 2) return;
  if (config.preserveAlignment === false && overlayCanvas) return;

  const resolvedConfig = resolveBinaryConfig(
    config,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor
  );
  const alignPositions = getAlignmentPositionsCached(version, moduleCount);
  const alignmentStyle = config.alignmentStyle || 'match_finder';
  for (const pos of alignPositions) {
    const centerX = marginPx + (pos.col + 0.5) * effectiveModuleSize;
    const centerY = marginPx + (pos.row + 0.5) * effectiveModuleSize;
    drawAlignmentPattern(
      ctx,
      centerX,
      centerY,
      effectiveModuleSize,
      alignmentStyle,
      resolvedConfig
    );
  }
}

function drawPreservedStructuralPatterns(spctx: StructuralPreservationCtx): void {
  drawPreservedFinderPatterns(spctx);
  drawPreservedAlignmentPatterns(spctx);

  if (!spctx.forceBinaryFunctionPatterns && spctx.preserveTiming) {
    preserveTimingModules(spctx);
  }

  preserveFormatVersionModules(spctx);
}

interface PixelGridCtx {
  // Canvas & layout
  ctx: CanvasRenderingContext2D;
  marginPx: number;
  subPixelSize: number;
  scale: number;
  scaledSize: number;
  // Data
  matrix: boolean[][];
  colors: (PixelColor | null)[][];
  // Mode flags
  isDitheredMode: boolean;
  needsBothDarkAndLightColors: boolean;
  needsExplicitLightModules: boolean;
  useColorRendering: boolean;
  useGradient: boolean;
  qrFirstMode: boolean;
  debug: boolean;
  // Colors
  effectiveFgColor: string;
  effectiveBgColor: string;
  gradientFill: string | CanvasGradient | null;
  // Subpixel tone rails
  subpixelDarkTargetLuma: number;
  subpixelDarkChroma: number;
  subpixelLightTargetLuma: number;
  subpixelLightChroma: number;
  // Dither params
  seed: number;
  dotMinRadiusPx: number;
  dotMaxRadiusPx: number;
  lightGrainDensity: number;
  lightGrainAlpha: number;
  // Callbacks
  quantizeRadius: (r: number) => number;
  localVariance: (x: number, y: number) => number;
  drawDitherDot: (x: number, y: number, radius: number, jitterN: number) => void;
  shouldForceBinaryModule: (row: number, col: number) => boolean;
}

function renderDitheredLightPixel(
  pgctx: PixelGridCtx,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: PixelColor | null
): void {
  const {
    ctx,
    seed,
    lightGrainDensity,
    lightGrainAlpha,
    qrFirstMode,
    dotMinRadiusPx,
    quantizeRadius,
    localVariance,
    drawDitherDot,
  } = pgctx;
  const sourceLuma = color ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255 : 1;
  const toneN = 1 - sourceLuma;
  const varN = localVariance(x, y);
  const noiseN = hash01(x, y, seed + 149);
  const grainChance = Math.max(
    0,
    Math.min(
      qrFirstMode ? 0.2 : 0.08,
      lightGrainDensity * (0.9 + toneN * 1.5 + varN * 1.1 + (noiseN - 0.5) * 0.3)
    )
  );
  if (grainChance > 0 && hash01(x, y, seed + 131) < grainChance) {
    const lightTarget = Math.max(0.32, Math.min(0.76, 0.46 + sourceLuma * 0.22 - varN * 0.06));
    const grain = color
      ? adjustLumaPreserveChroma(color, lightTarget, 1.42)
      : { r: 226, g: 226, b: 226 };
    ctx.fillStyle = `rgb(${grain.r},${grain.g},${grain.b})`;
    const prevAlpha = ctx.globalAlpha;
    const alpha = Math.min(
      0.12,
      Math.max(0.02, lightGrainAlpha * (0.55 + toneN * 0.4 + varN * 0.18 + (noiseN - 0.5) * 0.08))
    );
    ctx.globalAlpha = alpha;
    const grainRadius = Math.max(
      0.04,
      quantizeRadius(dotMinRadiusPx * (0.95 + toneN * 0.7 + varN * 0.22 + noiseN * 0.16))
    );
    drawDitherDot(dx, dy, grainRadius, 0.25 + 0.08 * noiseN);
    ctx.globalAlpha = prevAlpha;
  }
}

function renderDitheredDarkPixel(
  pgctx: PixelGridCtx,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: PixelColor | null,
  moduleLocked: boolean
): void {
  const {
    ctx,
    seed,
    useColorRendering,
    dotMinRadiusPx,
    dotMaxRadiusPx,
    quantizeRadius,
    localVariance,
    drawDitherDot,
  } = pgctx;
  const sourceLuma = color ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255 : 0.5;
  let drawLuma: number;
  if (useColorRendering && color) {
    const tone = (1 - sourceLuma) ** 0.86;
    const targetLuma = Math.max(0.04, Math.min(0.21, 0.04 + (1 - tone) * 0.17));
    const dark = adjustLumaPreserveChroma(color, targetLuma, 1.62);
    const darkR = dark.r;
    const darkG = dark.g;
    const darkB = dark.b;
    ctx.fillStyle = `rgb(${darkR},${darkG},${darkB})`;
    drawLuma = (0.299 * darkR + 0.587 * darkG + 0.114 * darkB) / 255;
  } else {
    const mono = Math.round(Math.max(8, Math.min(76, 8 + sourceLuma * 68)));
    ctx.fillStyle = `rgb(${mono},${mono},${mono})`;
    drawLuma = mono / 255;
  }

  const varN = localVariance(x, y);
  const noiseN = hash01(x, y, seed);
  const toneN = (1 - drawLuma) ** 0.9;
  if (!moduleLocked) {
    const dropoutNoise = hash01(x, y, seed + 257);
    const dropoutChance = Math.max(0, Math.min(0.05, 0.004 + (1 - toneN) * 0.03 + varN * 0.012));
    if (dropoutNoise < dropoutChance) return;
  }
  const radiusT = Math.max(
    0,
    Math.min(1, 0.16 + toneN * 0.68 + varN * 0.22 + (noiseN - 0.5) * 0.34)
  );
  const rawRadius = dotMinRadiusPx + radiusT * (dotMaxRadiusPx - dotMinRadiusPx);
  const radius = quantizeRadius(Math.max(dotMinRadiusPx, rawRadius));
  const jitterN = 0.66 + 0.34 * hash01(x, y, seed + 7);
  drawDitherDot(dx, dy, radius, jitterN);
}

function renderNonDitheredDarkPixel(
  pgctx: PixelGridCtx,
  dx: number,
  dy: number,
  color: PixelColor | null
): void {
  const {
    ctx,
    subPixelSize,
    useColorRendering,
    needsBothDarkAndLightColors,
    useGradient,
    gradientFill,
    effectiveFgColor,
    subpixelDarkTargetLuma,
    subpixelDarkChroma,
  } = pgctx;
  if (useColorRendering && color) {
    if (needsBothDarkAndLightColors) {
      const dark = adjustLumaPreserveChroma(color, subpixelDarkTargetLuma, subpixelDarkChroma);
      ctx.fillStyle = `rgb(${dark.r},${dark.g},${dark.b})`;
    } else {
      ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
    }
  } else {
    ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
  }
  ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
}

function renderNonDitheredLightPixel(
  pgctx: PixelGridCtx,
  dx: number,
  dy: number,
  color: PixelColor | null
): void {
  const {
    ctx,
    subPixelSize,
    useColorRendering,
    needsBothDarkAndLightColors,
    effectiveBgColor,
    subpixelLightTargetLuma,
    subpixelLightChroma,
  } = pgctx;
  if (needsBothDarkAndLightColors && useColorRendering && color) {
    const light = adjustLumaPreserveChroma(color, subpixelLightTargetLuma, subpixelLightChroma);
    ctx.fillStyle = `rgb(${light.r},${light.g},${light.b})`;
  } else {
    ctx.fillStyle = effectiveBgColor;
  }
  ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
}

function dispatchPixelRender(
  pgctx: PixelGridCtx,
  x: number,
  y: number,
  isDark: boolean | undefined,
  color: PixelColor | null,
  shouldDrawLightPixel: boolean
): void {
  const dx = pgctx.marginPx + x * pgctx.subPixelSize;
  const dy = pgctx.marginPx + y * pgctx.subPixelSize;
  const moduleRow = Math.floor(y / pgctx.scale);
  const moduleCol = Math.floor(x / pgctx.scale);
  const moduleLocked = pgctx.shouldForceBinaryModule(moduleRow, moduleCol);

  if (!isDark) {
    if (pgctx.isDitheredMode) {
      renderDitheredLightPixel(pgctx, x, y, dx, dy, color);
      return;
    }
    if (!shouldDrawLightPixel) return;
  }

  if (isDark) {
    if (pgctx.isDitheredMode) {
      renderDitheredDarkPixel(pgctx, x, y, dx, dy, color, moduleLocked);
    } else {
      renderNonDitheredDarkPixel(pgctx, dx, dy, color);
    }
  } else {
    renderNonDitheredLightPixel(pgctx, dx, dy, color);
  }
}

function renderScaledPixelGrid(pgctx: PixelGridCtx): void {
  const {
    scaledSize,
    matrix,
    colors,
    isDitheredMode,
    needsBothDarkAndLightColors,
    needsExplicitLightModules,
    useColorRendering,
    debug,
  } = pgctx;

  const shouldDrawLightPixel =
    !isDitheredMode &&
    (needsExplicitLightModules || (needsBothDarkAndLightColors && useColorRendering));

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const isDark = matrix[y]?.[x];
      const color = colors[y]?.[x] ?? null;

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

      dispatchPixelRender(pgctx, x, y, isDark, color, shouldDrawLightPixel);
    }
  }
}

interface ScaledPreserveFlags {
  preserveFinders: boolean;
  preserveTiming: boolean;
  preserveAlignment: boolean;
  protectFormat: boolean;
  protectVersion: boolean;
  preserveFixedDark: boolean;
}

function buildScaledPreserveFlags(config: QRGeneratorConfig): ScaledPreserveFlags {
  const preserveFunctional = config.preserveFunctionalPatterns === true;
  return {
    preserveFinders: config.preserveFinders !== false,
    preserveTiming: preserveFunctional
      ? config.preserveTiming !== false
      : config.preserveTiming === true,
    preserveAlignment: preserveFunctional
      ? config.preserveAlignment !== false
      : config.preserveAlignment === true,
    protectFormat: preserveFunctional
      ? config.protectFormatInfo !== false
      : config.protectFormatInfo === true,
    protectVersion: preserveFunctional
      ? config.protectVersionInfo !== false
      : config.protectVersionInfo === true,
    preserveFixedDark: preserveFunctional,
  };
}

function shouldForceScaledBinaryModule(flags: number, pf: ScaledPreserveFlags): boolean {
  if (flags === 0) return false;
  if ((flags & PATTERN_FIXED_DARK) !== 0) return pf.preserveFixedDark;
  if (isFinderRegionFlag(flags)) return pf.preserveFinders;
  if ((flags & PATTERN_TIMING) !== 0) return pf.preserveTiming;
  if ((flags & PATTERN_ALIGNMENT) !== 0) return pf.preserveAlignment;
  if ((flags & PATTERN_FORMAT) !== 0) return pf.protectFormat;
  if ((flags & PATTERN_VERSION) !== 0) return pf.protectVersion;
  return false;
}

interface ContrastBoostFlags {
  finderContrastBoost: boolean;
  alignmentContrastBoost: boolean;
  timingContrastBoost: boolean;
  formatContrastBoost: boolean;
  versionContrastBoost: boolean;
  fixedDarkContrastBoost: boolean;
}

function isScaledPatternBoostModule(flags: number, bf: ContrastBoostFlags): boolean {
  return (
    (bf.finderContrastBoost && isFinderRegionFlag(flags)) ||
    (bf.alignmentContrastBoost && (flags & PATTERN_ALIGNMENT) !== 0) ||
    (bf.timingContrastBoost && (flags & PATTERN_TIMING) !== 0) ||
    (bf.formatContrastBoost && (flags & PATTERN_FORMAT) !== 0) ||
    (bf.versionContrastBoost && (flags & PATTERN_VERSION) !== 0) ||
    (bf.fixedDarkContrastBoost && (flags & PATTERN_FIXED_DARK) !== 0)
  );
}

function enforceScaledQuietZoneClean(
  ctx: CanvasRenderingContext2D,
  marginPx: number,
  moduleCount: number,
  effectiveModuleSize: number,
  size: number,
  transparentBg: boolean,
  effectiveBgColor: string
): void {
  if (marginPx <= 0) return;
  const qrStart = marginPx;
  const qrSize = moduleCount * effectiveModuleSize;
  const qrEnd = qrStart + qrSize;
  if (transparentBg) {
    ctx.clearRect(0, 0, size, qrStart);
    ctx.clearRect(0, qrStart, qrStart, qrSize);
    ctx.clearRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSize);
    ctx.clearRect(0, qrEnd, size, Math.max(0, size - qrEnd));
    return;
  }
  ctx.fillStyle = effectiveBgColor;
  ctx.fillRect(0, 0, size, qrStart);
  ctx.fillRect(0, qrStart, qrStart, qrSize);
  ctx.fillRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSize);
  ctx.fillRect(0, qrEnd, size, Math.max(0, size - qrEnd));
}

function drawScaledStrictFunctionOverlay(
  ctx: CanvasRenderingContext2D,
  moduleCount: number,
  marginPx: number,
  effectiveModuleSize: number,
  qr: QRCodeInstance,
  effectiveFgColor: string,
  effectiveBgColor: string,
  functionalMap: Uint8Array,
  pf: ScaledPreserveFlags
): void {
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!shouldForceScaledBinaryModule(functionalMap[row * moduleCount + col], pf)) continue;
      const x = marginPx + col * effectiveModuleSize;
      const y = marginPx + row * effectiveModuleSize;
      ctx.fillStyle = qr.isDark(row, col) ? effectiveFgColor : effectiveBgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }
  }
}

function computeScaledLocalVariance(colors: (PixelColor | null)[][], x: number, y: number): number {
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
  return n > 0 ? Math.min(1, Math.sqrt(sum / n) * 3) : 0;
}

function sampleScaledModuleOverlayColor(
  colors: (PixelColor | null)[][],
  scaledSize: number,
  scale: number,
  row: number,
  col: number
): PixelColor | null {
  if (!colors?.length) return null;
  const px = Math.max(0, Math.min(scaledSize - 1, Math.floor((col + 0.5) * scale)));
  const py = Math.max(0, Math.min(scaledSize - 1, Math.floor((row + 0.5) * scale)));
  return (colors[py]?.[px] as PixelColor | undefined) ?? null;
}

function getScaledPreservationBlendTarget(
  qr: QRCodeInstance,
  colors: (PixelColor | null)[][],
  matrix: boolean[][],
  scaledSize: number,
  scale: number,
  isDitheredMode: boolean,
  moduleRow: number,
  moduleCol: number,
  scaledRow: number,
  scaledCol: number
): { r: number; g: number; b: number } {
  const moduleDark = qr.isDark(moduleRow, moduleCol);
  const sampled =
    (colors[scaledRow]?.[scaledCol] as PixelColor | undefined) ??
    sampleScaledModuleOverlayColor(colors, scaledSize, scale, moduleRow, moduleCol);
  if (!sampled) {
    return moduleDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  }
  const pixelDark = matrix[scaledRow]?.[scaledCol] === true;
  if (isDitheredMode) {
    if (moduleDark) {
      return pixelDark
        ? adjustLumaPreserveChroma(sampled, 0.04, 1.65)
        : adjustLumaPreserveChroma(sampled, 0.18, 1.3);
    }
    return pixelDark
      ? adjustLumaPreserveChroma(sampled, 0.9, 0.9)
      : adjustLumaPreserveChroma(sampled, 0.97, 0.8);
  }
  if (moduleDark) {
    return pixelDark
      ? adjustLumaPreserveChroma(sampled, 0.08, 1.28)
      : adjustLumaPreserveChroma(sampled, 0.2, 1.14);
  }
  return pixelDark
    ? adjustLumaPreserveChroma(sampled, 0.88, 0.95)
    : adjustLumaPreserveChroma(sampled, 0.97, 0.84);
}

interface PatternBoostCtx {
  ctx: CanvasRenderingContext2D;
  size: number;
  marginPx: number;
  effectiveModuleSize: number;
  subPixelSize: number;
  scaledSize: number;
  moduleCount: number;
  scale: number;
  finderStrengthN: number;
  blendPreservations: boolean;
  blendPreservationMode: 'dither' | 'overlay';
  isDitheredMode: boolean;
  bgLuma: number;
  ditherPaperOverlayMix: number;
  qr: QRCodeInstance;
  colors: (PixelColor | null)[][];
  matrix: boolean[][];
  functionalMap: Uint8Array;
  boostFlags: ContrastBoostFlags;
}

function drawScaledPatternContrastBoostOverlay(bctx: PatternBoostCtx): void {
  if (bctx.finderStrengthN <= 0) return;
  const bf = bctx.boostFlags;
  if (
    !(
      bf.finderContrastBoost ||
      bf.alignmentContrastBoost ||
      bf.timingContrastBoost ||
      bf.formatContrastBoost ||
      bf.versionContrastBoost ||
      bf.fixedDarkContrastBoost
    )
  ) {
    return;
  }

  const boostedModules: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < bctx.moduleCount; row++) {
    for (let col = 0; col < bctx.moduleCount; col++) {
      if (!isScaledPatternBoostModule(bctx.functionalMap[row * bctx.moduleCount + col], bf))
        continue;
      boostedModules.push({ row, col });
    }
  }
  if (boostedModules.length === 0) return;

  const blendChannelToward = (src: number, target: number, t: number): number =>
    Math.round(src + (target - src) * Math.max(0, Math.min(1, t)));
  const estimatePaperLuma = (sampled: PixelColor | null): number => {
    if (!sampled) return bctx.bgLuma;
    const sampledLuma = (0.299 * sampled.r + 0.587 * sampled.g + 0.114 * sampled.b) / 255;
    return (
      bctx.bgLuma * (1 - bctx.ditherPaperOverlayMix) + sampledLuma * bctx.ditherPaperOverlayMix
    );
  };

  if (bctx.blendPreservations) {
    blendPreservationPass(
      {
        ctx: bctx.ctx,
        size: bctx.size,
        marginPx: bctx.marginPx,
        effectiveModuleSize: bctx.effectiveModuleSize,
        subPixelSize: bctx.subPixelSize,
        scaledSize: bctx.scaledSize,
        moduleCount: bctx.moduleCount,
        finderStrengthN: bctx.finderStrengthN,
        blendPreservationMode: bctx.blendPreservationMode,
        isDitheredMode: bctx.isDitheredMode,
        qr: bctx.qr,
        colors: bctx.colors,
        getBlendTarget: (mRow, mCol, sRow, sCol) =>
          getScaledPreservationBlendTarget(
            bctx.qr,
            bctx.colors,
            bctx.matrix,
            bctx.scaledSize,
            bctx.scale,
            bctx.isDitheredMode,
            mRow,
            mCol,
            sRow,
            sCol
          ),
        sampleModuleColor: (row, col) =>
          sampleScaledModuleOverlayColor(bctx.colors, bctx.scaledSize, bctx.scale, row, col),
        estimatePaperLuma,
        blendChannelToward,
      },
      boostedModules
    );
    return;
  }

  bctx.ctx.save();
  bctx.ctx.globalAlpha = bctx.finderStrengthN;
  for (const { row, col } of boostedModules) {
    const x = bctx.marginPx + col * bctx.effectiveModuleSize;
    const y = bctx.marginPx + row * bctx.effectiveModuleSize;
    bctx.ctx.fillStyle = bctx.qr.isDark(row, col) ? 'rgb(0,0,0)' : 'rgb(255,255,255)';
    bctx.ctx.fillRect(x, y, bctx.effectiveModuleSize, bctx.effectiveModuleSize);
  }
  bctx.ctx.restore();
}

function drawScaledDitherBackdrop(
  ctx: CanvasRenderingContext2D,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  marginPx: number,
  qrDrawSize: number,
  ditherBackdropAlpha: number,
  ditherBackdropWash: number,
  effectiveBgColor: string
): void {
  const prevSmoothingEnabled = ctx.imageSmoothingEnabled;
  const prevSmoothingQuality = ctx.imageSmoothingQuality;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.save();
  ctx.globalAlpha = ditherBackdropAlpha;
  ctx.drawImage(overlayCanvas as CanvasImageSource, marginPx, marginPx, qrDrawSize, qrDrawSize);
  if (ditherBackdropWash > 0) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = ditherBackdropWash;
    ctx.fillStyle = effectiveBgColor;
    ctx.fillRect(marginPx, marginPx, qrDrawSize, qrDrawSize);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  ctx.imageSmoothingEnabled = prevSmoothingEnabled;
  ctx.imageSmoothingQuality = prevSmoothingQuality;
}

interface ScaledOverlayModeInfo {
  isDitheredMode: boolean;
  forceBinaryFunctionPatterns: boolean;
  isSubpixelMode: boolean;
  needsBothDarkAndLightColors: boolean;
}

function classifyScaledOverlayMode(config: QRGeneratorConfig): ScaledOverlayModeInfo {
  const isDitheredMode =
    config.overlayMode === 'dithered' ||
    config.overlayMode === 'blue_noise' ||
    config.overlayMode === 'blue-noise';
  const isSubpixelMode =
    config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  return {
    isDitheredMode,
    forceBinaryFunctionPatterns: isDitheredMode,
    isSubpixelMode,
    needsBothDarkAndLightColors: isSubpixelMode,
  };
}

interface SubpixelToneParams {
  subpixelDarkTargetLuma: number;
  subpixelLightTargetLuma: number;
  subpixelDarkChroma: number;
  subpixelLightChroma: number;
}

function computeSubpixelToneParams(config: QRGeneratorConfig): SubpixelToneParams {
  const strength = curveIntensity(config.overlayIntensity ?? 100);
  return {
    subpixelDarkTargetLuma: 0.2 - strength * 0.1,
    subpixelLightTargetLuma: 0.8 + strength * 0.15,
    subpixelDarkChroma: 1.15 + strength * 0.35,
    subpixelLightChroma: 0.92 - strength * 0.24,
  };
}

interface DitherBackdropParams {
  ditherBackdropAlpha: number;
  ditherBackdropWash: number;
  bgLuma: number;
  ditherPaperOverlayMix: number;
}

function computeDitherBackdropParams(
  config: QRGeneratorConfig,
  effectiveBgColor: string,
  isDitheredMode: boolean,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  useColorRendering: boolean
): DitherBackdropParams {
  const ditherBackdropAlpha = Math.max(0, Math.min(0.75, config.ditherBackdropAlpha ?? 0.4));
  const overlayTone = curveIntensity(config.overlayIntensity ?? 100);
  const adaptiveBackdropWash = Math.max(0.06, Math.min(0.22, 0.06 + overlayTone * 0.14));
  const ditherBackdropWash = Math.max(
    0,
    Math.min(1, config.ditherBackdropWash ?? adaptiveBackdropWash)
  );
  const bgRgb = parseColor(effectiveBgColor) ?? { r: 255, g: 255, b: 255, a: 1 };
  const bgLuma = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) / 255;
  const ditherPaperOverlayMix =
    isDitheredMode && overlayCanvas && useColorRendering
      ? Math.max(0, Math.min(1, ditherBackdropAlpha * (1 - ditherBackdropWash)))
      : 0;
  return { ditherBackdropAlpha, ditherBackdropWash, bgLuma, ditherPaperOverlayMix };
}

interface DitherDotParams {
  dotMinRadiusPx: number;
  dotMaxRadiusPx: number;
  lightGrainDensity: number;
  lightGrainAlpha: number;
  seed: number;
}

function computeDitherDotParams(config: QRGeneratorConfig, subPixelSize: number): DitherDotParams {
  const defaultDotMin = subPixelSize * 0.14;
  const defaultDotMax = subPixelSize * 0.62;
  const dotMinRadiusPx = Math.max(
    0.02,
    Math.min(subPixelSize * 0.42, config.dotMinRadiusPx ?? defaultDotMin)
  );
  const dotMaxRadiusPx = Math.max(
    dotMinRadiusPx + Math.max(0.01, subPixelSize * 0.08),
    Math.min(subPixelSize * 0.78, config.dotMaxRadiusPx ?? defaultDotMax)
  );
  const qrFirstLightBoost = config.qrFirstMode ? 1.3 : 1;
  return {
    dotMinRadiusPx,
    dotMaxRadiusPx,
    lightGrainDensity: Math.max(
      0,
      Math.min(0.025, (config.lightGrainDensity ?? 0.004) * qrFirstLightBoost)
    ),
    lightGrainAlpha: Math.max(
      0,
      Math.min(0.1, (config.lightGrainAlpha ?? 0.05) * (config.qrFirstMode ? 1.15 : 1))
    ),
    seed: config.seed ?? 1337,
  };
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
  storeMatrixFn: (qr: QRCodeInstance, moduleCount: number) => void,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  // Get pixel decision matrix (unified for all scaled modes)
  const pixelData = await generatePixelDecisionMatrix(
    qr,
    config,
    overlayCanvas,
    moduleCount,
    createCanvasFn,
    canvasFactory,
    releaseCanvasFn
  );
  const { matrix, colors } = pixelData;
  const scaledSize = matrix.length;

  // UNIFIED: Apply quietZoneMinEnforce setting
  const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
  const baseMarginModules = Math.max(quietZoneMin, config.margin);

  // Calculate micro-pixel size with fractional support for smoother high-density rendering.
  const subPixelSize = Math.max(0.5, config.moduleSize / scale);
  const effectiveModuleSize = subPixelSize * scale;

  // Keep QR centered when frame text/border reserves extra canvas area.
  const frameOffsetModules = config.frameStyle && config.frameStyle !== 'none' ? 2 : 0;
  const marginModules = baseMarginModules + frameOffsetModules;
  const marginPx = marginModules * effectiveModuleSize;
  const size = Math.round(scaledSize * subPixelSize + marginPx * 2);

  const canvas = await createCanvasFn(size, size);
  const ctx =
    (canvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null) ??
    (canvas.getContext('2d') as CanvasRenderingContext2D | null);
  if (!ctx) {
    throw new Error('Failed to acquire scaled render context');
  }
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
  const useColorRendering = Boolean(overlayCanvas && config.colorMode !== 'bw');

  const { isDitheredMode, forceBinaryFunctionPatterns, needsBothDarkAndLightColors } =
    classifyScaledOverlayMode(config);
  const {
    subpixelDarkTargetLuma,
    subpixelLightTargetLuma,
    subpixelDarkChroma,
    subpixelLightChroma,
  } = computeSubpixelToneParams(config);
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
  const pf = buildScaledPreserveFlags(config);
  const {
    preserveFinders,
    preserveTiming,
    preserveAlignment,
    protectFormat,
    protectVersion,
    preserveFixedDark,
  } = pf;
  const functionalMap = getScaledFunctionalMap(moduleCount, version);

  const getPatternFlags = (row: number, col: number): number =>
    functionalMap[row * moduleCount + col];
  const qrDrawSize = scaledSize * subPixelSize;
  const { ditherBackdropAlpha, ditherBackdropWash, bgLuma, ditherPaperOverlayMix } =
    computeDitherBackdropParams(
      config,
      effectiveBgColor,
      isDitheredMode,
      overlayCanvas,
      useColorRendering
    );

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
      finderDitherStrength: config.finderDitherStrength,
      blendPreservations: config.blendPreservations,
      hasColors: !!(colors?.length && colors[0]?.length),
      sampleColor: colors?.[5]?.[5],
    });
  }

  if (isDitheredMode && overlayCanvas && useColorRendering) {
    drawScaledDitherBackdrop(
      ctx,
      overlayCanvas,
      marginPx,
      qrDrawSize,
      ditherBackdropAlpha,
      ditherBackdropWash,
      effectiveBgColor
    );
  }

  const { dotMinRadiusPx, dotMaxRadiusPx, lightGrainDensity, lightGrainAlpha, seed } =
    computeDitherDotParams(config, subPixelSize);
  const maxRadiusBound = subPixelSize * 0.78;
  const radiusBins = 9;

  const quantizeRadius = (r: number): number => {
    const t = Math.max(
      0,
      Math.min(1, (r - dotMinRadiusPx) / Math.max(1e-6, dotMaxRadiusPx - dotMinRadiusPx))
    );
    const q = Math.round(t * (radiusBins - 1)) / Math.max(1, radiusBins - 1);
    return dotMinRadiusPx + q * (dotMaxRadiusPx - dotMinRadiusPx);
  };

  const localVariance = (x: number, y: number): number => computeScaledLocalVariance(colors, x, y);

  const drawDitherDot = (x: number, y: number, radius: number, jitterN: number): void => {
    const jitterAmp = subPixelSize * 0.2;
    const jxA = hash01(x * 1.37, y * 0.83, seed + 11) - 0.5;
    const jxB = hash01(x * 0.61, y * 1.91, seed + 53) - 0.5;
    const jyA = hash01(x * 0.79, y * 1.23, seed + 29) - 0.5;
    const jyB = hash01(x * 1.71, y * 0.57, seed + 89) - 0.5;
    const jx = (jxA * 0.66 + jxB * 0.34) * 2 * jitterAmp * jitterN;
    const jy = (jyA * 0.66 + jyB * 0.34) * 2 * jitterAmp * jitterN;
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

  const shouldForceBinaryModule = (row: number, col: number): boolean =>
    shouldForceScaledBinaryModule(getPatternFlags(row, col), pf);

  const rawFinderDitherStrength =
    typeof config.finderDitherStrength === 'number' && Number.isFinite(config.finderDitherStrength)
      ? config.finderDitherStrength
      : 65;
  const finderDitherStrength = Math.max(0, Math.min(100, rawFinderDitherStrength));
  const finderStrengthN = finderDitherStrength / 100;
  const blendPreservations = config.blendPreservations === true;
  const blendPreservationMode: 'dither' | 'overlay' =
    config.blendPreservationMode === 'dither' ? 'dither' : 'overlay';
  const boostFlags: ContrastBoostFlags = {
    finderContrastBoost: !preserveFinders,
    alignmentContrastBoost: !preserveAlignment,
    timingContrastBoost: !preserveTiming,
    formatContrastBoost: !protectFormat,
    versionContrastBoost: !protectVersion,
    fixedDarkContrastBoost: !preserveFixedDark,
  };

  renderScaledPixelGrid({
    ctx,
    marginPx,
    subPixelSize,
    scale,
    scaledSize,
    matrix,
    colors,
    isDitheredMode,
    needsBothDarkAndLightColors,
    needsExplicitLightModules,
    useColorRendering,
    useGradient: !!useGradient,
    qrFirstMode: config.qrFirstMode === true,
    debug,
    effectiveFgColor,
    effectiveBgColor,
    gradientFill,
    subpixelDarkTargetLuma,
    subpixelDarkChroma,
    subpixelLightTargetLuma,
    subpixelLightChroma,
    seed,
    dotMinRadiusPx,
    dotMaxRadiusPx,
    lightGrainDensity,
    lightGrainAlpha,
    quantizeRadius,
    localVariance,
    drawDitherDot,
    shouldForceBinaryModule,
  });

  await applyModuleShapeMask({
    ctx,
    size,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    qr,
    config,
    effectiveBgColor,
    getPatternFlags,
    createCanvasFn,
    releaseCanvasFn,
  });

  drawScaledPatternContrastBoostOverlay({
    ctx,
    size,
    marginPx,
    effectiveModuleSize,
    subPixelSize,
    scaledSize,
    moduleCount,
    scale,
    finderStrengthN,
    blendPreservations,
    blendPreservationMode,
    isDitheredMode,
    bgLuma,
    ditherPaperOverlayMix,
    qr,
    colors,
    matrix,
    functionalMap,
    boostFlags,
  });

  if (forceBinaryFunctionPatterns) {
    drawScaledStrictFunctionOverlay(
      ctx,
      moduleCount,
      marginPx,
      effectiveModuleSize,
      qr,
      effectiveFgColor,
      effectiveBgColor,
      functionalMap,
      pf
    );
  }
  drawPreservedStructuralPatterns({
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    qr,
    config,
    version,
    forceBinaryFunctionPatterns,
    preserveFinders,
    preserveTiming,
    preserveAlignment,
    protectFormat,
    protectVersion,
    effectiveFgColor,
    effectiveBgColor,
    useGradient: !!useGradient,
    gradientFill,
    overlayCanvas,
    getPatternFlags,
    debug,
  });

  enforceScaledQuietZoneClean(
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    size,
    config.transparentBg === true,
    effectiveBgColor
  );

  // UNIFIED: Draw frame if configured
  drawFrame(ctx, size, effectiveModuleSize, marginModules, config);

  // Store the QR matrix for vector SVG export
  // Export should reflect the canonical QR modules, not the scaled pixel decision matrix.
  // The pixel matrix is used for rendering effects (dither/subpixel) and can introduce
  // ambiguity when collapsed back to module resolution.
  storeMatrixFn(qr, moduleCount);

  return canvas;
}
