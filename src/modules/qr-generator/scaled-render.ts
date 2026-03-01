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
const scaledFunctionalMapCache = new Map<string, Uint8Array>();

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

function buildScaledFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const map = new Uint8Array(moduleCount * moduleCount);
  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;
    for (let col = 0; col < moduleCount; col++) {
      const idx = rowBase + col;
      if (isFinderPatternSpec(row, col, moduleCount)) {
        map[idx] |= PATTERN_FINDER;
      }
      if (isFinderSeparator(row, col, moduleCount)) {
        map[idx] |= PATTERN_FINDER_SEPARATOR;
      }
      if (isTimingPatternSpec(row, col, moduleCount)) {
        map[idx] |= PATTERN_TIMING;
      }
      if (isAlignmentPatternSpec(row, col, moduleCount, version)) {
        map[idx] |= PATTERN_ALIGNMENT;
      }
      if (isFormatInfoSpec(row, col, moduleCount)) {
        map[idx] |= PATTERN_FORMAT;
      }
      if (isVersionInfoSpec(row, col, moduleCount, version)) {
        map[idx] |= PATTERN_VERSION;
      }
      if (_isDarkModule(row, col, moduleCount)) {
        map[idx] |= PATTERN_FIXED_DARK;
      }
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

  // Dithered mode is ink-dominant: render dark dots over mostly open paper.
  const isDitheredMode =
    config.overlayMode === 'dithered' ||
    config.overlayMode === 'blue_noise' ||
    config.overlayMode === 'blue-noise';
  const forceBinaryFunctionPatterns = isDitheredMode;
  const isSubpixelMode =
    config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  const needsBothDarkAndLightColors = isSubpixelMode;
  const subpixelToneStrength = Math.max(0, Math.min(1, (config.overlayIntensity ?? 100) / 100));
  // Subpixel needs explicit dark/light tonal rails; otherwise both rails collapse to
  // near-identical image color and QR structure disappears.
  const subpixelDarkTargetLuma = 0.2 - subpixelToneStrength * 0.1;
  const subpixelLightTargetLuma = 0.8 + subpixelToneStrength * 0.15;
  const subpixelDarkChroma = 1.15 + subpixelToneStrength * 0.35;
  const subpixelLightChroma = 0.92 - subpixelToneStrength * 0.24;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
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
  const functionalMap = getScaledFunctionalMap(moduleCount, version);
  const isFinderRegionFlag = (flags: number): boolean =>
    (flags & (PATTERN_FINDER | PATTERN_FINDER_SEPARATOR)) !== 0;
  const getPatternFlags = (row: number, col: number): number =>
    functionalMap[row * moduleCount + col];
  const qrDrawSize = scaledSize * subPixelSize;
  const ditherBackdropAlpha = Math.max(0, Math.min(0.75, config.ditherBackdropAlpha ?? 0.4));
  const ditherBackdropWash = Math.max(0, Math.min(1, config.ditherBackdropWash ?? 0.18));
  const bgRgb = parseColor(effectiveBgColor) ?? { r: 255, g: 255, b: 255, a: 1 };
  const bgLuma = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) / 255;
  const ditherPaperOverlayMix =
    isDitheredMode && overlayCanvas && useColorRendering
      ? Math.max(0, Math.min(1, ditherBackdropAlpha * (1 - ditherBackdropWash)))
      : 0;

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
    const prevSmoothingEnabled = ctx.imageSmoothingEnabled;
    const prevSmoothingQuality = ctx.imageSmoothingQuality;
    // Overlay backdrop must be sampled smoothly; module rendering stays crisp below.
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
  const maxRadiusBound = subPixelSize * 0.78;
  const qrFirstLightBoost = config.qrFirstMode ? 1.3 : 1;
  const lightGrainDensity = Math.max(
    0,
    Math.min(0.025, (config.lightGrainDensity ?? 0.004) * qrFirstLightBoost)
  );
  const lightGrainAlpha = Math.max(
    0,
    Math.min(0.1, (config.lightGrainAlpha ?? 0.05) * (config.qrFirstMode ? 1.15 : 1))
  );
  const seed = config.seed ?? 1337;
  const radiusBins = 9;

  const hash01 = (x: number, y: number, s: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453;
    return n - Math.floor(n);
  };

  const quantizeRadius = (r: number): number => {
    const t = Math.max(
      0,
      Math.min(1, (r - dotMinRadiusPx) / Math.max(1e-6, dotMaxRadiusPx - dotMinRadiusPx))
    );
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

  const shouldForceBinaryModule = (row: number, col: number): boolean => {
    const flags = getPatternFlags(row, col);
    if (flags === 0) return false;
    // Fixed dark module follows preserve/protect policy.
    if ((flags & PATTERN_FIXED_DARK) !== 0) return preserveFixedDark;
    // Finder regions/separators follow preserveFinders explicitly.
    if (isFinderRegionFlag(flags)) {
      return preserveFinders;
    }
    if ((flags & PATTERN_TIMING) !== 0) return preserveTiming;
    if ((flags & PATTERN_ALIGNMENT) !== 0) return preserveAlignment;
    if ((flags & PATTERN_FORMAT) !== 0) return protectFormat;
    if ((flags & PATTERN_VERSION) !== 0) return protectVersion;
    return false;
  };

  const enforceQuietZoneClean = (): void => {
    if (marginPx <= 0) return;
    const qrStart = marginPx;
    const qrSize = moduleCount * effectiveModuleSize;
    const qrEnd = qrStart + qrSize;
    if (config.transparentBg) {
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
  };

  const drawStrictFunctionOverlay = (): void => {
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!shouldForceBinaryModule(row, col)) continue;
        const x = marginPx + col * effectiveModuleSize;
        const y = marginPx + row * effectiveModuleSize;
        ctx.fillStyle = qr.isDark(row, col) ? effectiveFgColor : effectiveBgColor;
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
      }
    }
  };

  // Preservation strength applies to all scaled modes, not only dithered/blue-noise.
  // Otherwise toggles can appear inert in modes like subpixel/dither/extreme.
  const finderContrastBoost = !preserveFinders;
  const alignmentContrastBoost = !preserveAlignment;
  const timingContrastBoost = !preserveTiming;
  const formatContrastBoost = !protectFormat;
  const versionContrastBoost = !protectVersion;
  const fixedDarkContrastBoost = !preserveFixedDark;
  const rawFinderDitherStrength =
    typeof config.finderDitherStrength === 'number' && Number.isFinite(config.finderDitherStrength)
      ? config.finderDitherStrength
      : 65;
  const finderDitherStrength = Math.max(0, Math.min(100, rawFinderDitherStrength));
  const finderStrengthN = finderDitherStrength / 100;
  const blendPreservations = config.blendPreservations === true;
  const blendPreservationMode = config.blendPreservationMode === 'dither' ? 'dither' : 'overlay';
  const blendChannelToward = (src: number, target: number, t: number): number =>
    Math.round(src + (target - src) * Math.max(0, Math.min(1, t)));
  const sampleModuleOverlayColor = (row: number, col: number): PixelColor | null => {
    if (!colors?.length) return null;
    const px = Math.max(0, Math.min(scaledSize - 1, Math.floor((col + 0.5) * scale)));
    const py = Math.max(0, Math.min(scaledSize - 1, Math.floor((row + 0.5) * scale)));
    return (colors[py]?.[px] as PixelColor | undefined) ?? null;
  };
  const estimatePaperLuma = (sampled: PixelColor | null): number => {
    if (!sampled) return bgLuma;
    const sampledLuma = (0.299 * sampled.r + 0.587 * sampled.g + 0.114 * sampled.b) / 255;
    return bgLuma * (1 - ditherPaperOverlayMix) + sampledLuma * ditherPaperOverlayMix;
  };
  const getPreservationBlendTargetForScaledPixel = (
    moduleRow: number,
    moduleCol: number,
    scaledRow: number,
    scaledCol: number
  ): { r: number; g: number; b: number } => {
    const moduleDark = qr.isDark(moduleRow, moduleCol);
    const sampled =
      (colors[scaledRow]?.[scaledCol] as PixelColor | undefined) ??
      sampleModuleOverlayColor(moduleRow, moduleCol);
    if (!sampled) {
      return moduleDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    }
    // Keep preservation blending image-aware in all scaled modes.
    // Two rails are selected from the existing scaled pixel decision matrix so
    // preservations stay integrated with the active mode rather than becoming solids.
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
  };
  const isPatternBoostModule = (row: number, col: number): boolean => {
    const flags = getPatternFlags(row, col);
    const isFinderBoostModule = finderContrastBoost && isFinderRegionFlag(flags);
    const isAlignmentBoostModule = alignmentContrastBoost && (flags & PATTERN_ALIGNMENT) !== 0;
    const isTimingBoostModule = timingContrastBoost && (flags & PATTERN_TIMING) !== 0;
    const isFormatBoostModule = formatContrastBoost && (flags & PATTERN_FORMAT) !== 0;
    const isVersionBoostModule = versionContrastBoost && (flags & PATTERN_VERSION) !== 0;
    const isFixedDarkBoostModule = fixedDarkContrastBoost && (flags & PATTERN_FIXED_DARK) !== 0;
    return (
      isFinderBoostModule ||
      isAlignmentBoostModule ||
      isTimingBoostModule ||
      isFormatBoostModule ||
      isVersionBoostModule ||
      isFixedDarkBoostModule
    );
  };
  const drawPatternContrastBoostOverlay = (): void => {
    if (finderStrengthN <= 0) return;
    if (
      !(
        finderContrastBoost ||
        alignmentContrastBoost ||
        timingContrastBoost ||
        formatContrastBoost ||
        versionContrastBoost ||
        fixedDarkContrastBoost
      )
    ) {
      return;
    }

    const boostedModules: Array<{ row: number; col: number }> = [];
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!isPatternBoostModule(row, col)) continue;
        boostedModules.push({ row, col });
      }
    }
    if (boostedModules.length === 0) return;

    if (blendPreservations) {
      // Blend preservation targets with the already-rendered current overlay mode output.
      // This keeps preservation behavior mode-aware (dithered/blue-noise/etc.) instead of
      // painting a separate standalone texture over the top.
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      for (const { row, col } of boostedModules) {
        const x = marginPx + col * effectiveModuleSize;
        const y = marginPx + row * effectiveModuleSize;
        const x0 = Math.max(0, Math.floor(x));
        const y0 = Math.max(0, Math.floor(y));
        const x1 = Math.min(size, Math.ceil(x + effectiveModuleSize));
        const y1 = Math.min(size, Math.ceil(y + effectiveModuleSize));
        for (let py = y0; py < y1; py++) {
          let idx = (py * size + x0) * 4;
          const scaledRow = Math.max(
            0,
            Math.min(scaledSize - 1, Math.floor((py - marginPx) / Math.max(1e-6, subPixelSize)))
          );
          for (let px = x0; px < x1; px++) {
            const scaledCol = Math.max(
              0,
              Math.min(scaledSize - 1, Math.floor((px - marginPx) / Math.max(1e-6, subPixelSize)))
            );
            const sampled =
              (colors[scaledRow]?.[scaledCol] as PixelColor | undefined) ??
              sampleModuleOverlayColor(row, col);
            const paperLuma = estimatePaperLuma(sampled ?? null);
            const pixelLuma =
              (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
            const moduleDark = qr.isDark(row, col);
            // "dither" mode keeps preservation blending on existing dither rails.
            // "overlay" mode allows full-module pass-through coloring.
            const rawInkContrast = paperLuma - pixelLuma;
            const inkCoverageN =
              blendPreservationMode === 'dither' && isDitheredMode
                ? moduleDark
                  ? Math.max(0, Math.min(1, (rawInkContrast - 0.015) / 0.28))
                  : Math.max(0, Math.min(1, (rawInkContrast + 0.03) / 0.22))
                : 1;
            if (inkCoverageN <= 1e-3) {
              idx += 4;
              continue;
            }
            const target = getPreservationBlendTargetForScaledPixel(row, col, scaledRow, scaledCol);
            const t = finderStrengthN * inkCoverageN;
            data[idx] = blendChannelToward(data[idx], target.r, t);
            data[idx + 1] = blendChannelToward(data[idx + 1], target.g, t);
            data[idx + 2] = blendChannelToward(data[idx + 2], target.b, t);
            idx += 4;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      return;
    }

    ctx.save();
    ctx.globalAlpha = finderStrengthN;
    for (const { row, col } of boostedModules) {
      const x = marginPx + col * effectiveModuleSize;
      const y = marginPx + row * effectiveModuleSize;
      ctx.fillStyle = qr.isDark(row, col) ? 'rgb(0,0,0)' : 'rgb(255,255,255)';
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }
    ctx.restore();
  };

  // Render all pixels
  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const isDark = matrix[y]?.[x];
      const color = (colors[y]?.[x] ?? null) as PixelColor | null;

      const shouldDrawLightPixel =
        !isDitheredMode &&
        (needsExplicitLightModules || (needsBothDarkAndLightColors && useColorRendering));

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

      const dx = marginPx + x * subPixelSize;
      const dy = marginPx + y * subPixelSize;
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const moduleLocked = shouldForceBinaryModule(moduleRow, moduleCol);

      if (!isDark) {
        if (isDitheredMode) {
          const sourceLuma = color
            ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255
            : 1;
          const toneN = 1 - sourceLuma;
          const varN = localVariance(x, y);
          const noiseN = hash01(x, y, seed + 149);
          const grainChance = Math.max(
            0,
            Math.min(
              config.qrFirstMode ? 0.2 : 0.08,
              lightGrainDensity * (0.9 + toneN * 1.5 + varN * 1.1 + (noiseN - 0.5) * 0.3)
            )
          );
          if (grainChance > 0 && hash01(x, y, seed + 131) < grainChance) {
            const lightTarget = Math.max(
              0.32,
              Math.min(0.76, 0.46 + sourceLuma * 0.22 - varN * 0.06)
            );
            const grain = color
              ? adjustLumaPreserveChroma(color, lightTarget, 1.42)
              : { r: 226, g: 226, b: 226 };
            ctx.fillStyle = `rgb(${grain.r},${grain.g},${grain.b})`;
            const prevAlpha = ctx.globalAlpha;
            const alpha = Math.min(
              0.12,
              Math.max(
                0.02,
                lightGrainAlpha * (0.55 + toneN * 0.4 + varN * 0.18 + (noiseN - 0.5) * 0.08)
              )
            );
            ctx.globalAlpha = alpha;
            const grainRadius = Math.max(
              0.04,
              quantizeRadius(dotMinRadiusPx * (0.95 + toneN * 0.7 + varN * 0.22 + noiseN * 0.16))
            );
            drawDitherDot(dx, dy, grainRadius, 0.25 + 0.08 * noiseN);
            ctx.globalAlpha = prevAlpha;
          }
          continue;
        }
        if (!shouldDrawLightPixel) continue;
      }

      if (isDark) {
        if (isDitheredMode) {
          const sourceLuma = color
            ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255
            : 0.5;
          let drawLuma = sourceLuma;
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
            const dropoutChance = Math.max(
              0,
              Math.min(0.05, 0.004 + (1 - toneN) * 0.03 + varN * 0.012)
            );
            if (dropoutNoise < dropoutChance) continue;
          }
          const radiusT = Math.max(
            0,
            Math.min(1, 0.16 + toneN * 0.68 + varN * 0.22 + (noiseN - 0.5) * 0.34)
          );
          const rawRadius = dotMinRadiusPx + radiusT * (dotMaxRadiusPx - dotMinRadiusPx);
          const radius = quantizeRadius(Math.max(dotMinRadiusPx, rawRadius));
          const jitterN = 0.66 + 0.34 * hash01(x, y, seed + 7);
          drawDitherDot(dx, dy, radius, jitterN);
        } else if (useColorRendering && color) {
          if (needsBothDarkAndLightColors) {
            const dark = adjustLumaPreserveChroma(
              color,
              subpixelDarkTargetLuma,
              subpixelDarkChroma
            );
            ctx.fillStyle = `rgb(${dark.r},${dark.g},${dark.b})`;
          } else {
            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
          }
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        } else {
          // B&W mode or no color data: use foreground color (with optional gradient)
          ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      } else {
        // Non-dithered light rendering paths.
        if (needsBothDarkAndLightColors && useColorRendering && color) {
          const light = adjustLumaPreserveChroma(
            color,
            subpixelLightTargetLuma,
            subpixelLightChroma
          );
          ctx.fillStyle = `rgb(${light.r},${light.g},${light.b})`;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        } else {
          ctx.fillStyle = effectiveBgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      }
    }
  }

  // Apply module-shape masking for non-square module styles.
  // This clips the sub-pixel rendered content (dithered dots, subpixel grid, etc.)
  // to the configured module shape (rounded, dots, diamond, star, heart) while
  // preserving the visual overlay effects within each module boundary.
  const moduleStyleName = config.moduleStyle || 'square';
  if (moduleStyleName !== 'square' && moduleStyleName !== 'connected') {
    const maskCanvas = await createCanvasFn(size, size);
    const maskCtx = maskCanvas.getContext('2d') as CanvasRenderingContext2D;
    maskCtx.imageSmoothingEnabled = false;

    // Margin and frame areas: fully visible
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
        const flags = getPatternFlags(row, col);

        // Structural pattern modules: fully visible (drawn separately with their own styles)
        if (
          isFinderRegionFlag(flags) ||
          (flags & PATTERN_ALIGNMENT) !== 0 ||
          (flags & PATTERN_TIMING) !== 0 ||
          (flags & PATTERN_FORMAT) !== 0 ||
          (flags & PATTERN_VERSION) !== 0 ||
          (flags & PATTERN_FIXED_DARK) !== 0
        ) {
          maskCtx.fillStyle = 'white';
          maskCtx.fillRect(mx, my, effectiveModuleSize, effectiveModuleSize);
          continue;
        }

        // Data modules: only dark modules get shaped; light modules stay fully visible
        if (!qr.isDark(row, col)) {
          maskCtx.fillStyle = 'white';
          maskCtx.fillRect(mx, my, effectiveModuleSize, effectiveModuleSize);
          continue;
        }

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
    }

    // Apply mask: keep only pixels where mask is white
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas as CanvasImageSource, 0, 0);

    // Fill background behind masked-out areas
    ctx.globalCompositeOperation = 'destination-over';
    if (!config.transparentBg) {
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(0, 0, size, size);
    }

    ctx.globalCompositeOperation = 'source-over';
    if (releaseCanvasFn) releaseCanvasFn(maskCanvas);
  }

  drawPatternContrastBoostOverlay();

  if (forceBinaryFunctionPatterns) {
    drawStrictFunctionOverlay();
  }

  // UNIFIED: Draw styled finder patterns on top of pixel rendering
  // Only draw finders separately if preserveFinders is true OR there's no overlay
  // When preserveFinders=false with overlay, finder modules were already rendered with overlay effects
  const shouldDrawFindersFirst =
    !forceBinaryFunctionPatterns && (config.preserveFinders !== false || !overlayCanvas);

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
    !forceBinaryFunctionPatterns && (config.preserveAlignment !== false || !overlayCanvas);
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
  const shouldPreserveTimingModules = !forceBinaryFunctionPatterns && preserveTiming;
  if (shouldPreserveTimingModules) {
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
  const shouldProtectFormatInfo = !forceBinaryFunctionPatterns && protectFormat;
  const shouldProtectVersionInfo = !forceBinaryFunctionPatterns && protectVersion;

  if (shouldProtectFormatInfo || shouldProtectVersionInfo) {
    let formatCount = 0;
    let versionCount = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const flags = getPatternFlags(row, col);
        const isFormat = shouldProtectFormatInfo && (flags & PATTERN_FORMAT) !== 0;
        const isVersion = shouldProtectVersionInfo && (flags & PATTERN_VERSION) !== 0;
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
        protectFormat: shouldProtectFormatInfo,
        protectVersion: shouldProtectVersionInfo,
        formatCount,
        versionCount,
        preservedTiming: shouldPreserveTimingModules,
      });
    }
  }

  // Ensure quiet zone is clean after all module/pattern rendering.
  enforceQuietZoneClean();

  // UNIFIED: Draw frame if configured
  drawFrame(ctx, size, effectiveModuleSize, marginModules, config);

  // Store the QR matrix for vector SVG export
  // Export should reflect the canonical QR modules, not the scaled pixel decision matrix.
  // The pixel matrix is used for rendering effects (dither/subpixel) and can introduce
  // ambiguity when collapsed back to module resolution.
  storeMatrixFn(qr, moduleCount);

  return canvas;
}
