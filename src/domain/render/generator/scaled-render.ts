/**
 * Scaled QR Rendering
 * Handles all scaled overlay modes (dithered, blue-noise, subpixel)
 */

import type { CanvasFactory } from '../../../platform/browser/canvas/canvas-factory';
import { createGradientFill, drawFrame, drawFrameBackground } from './drawing';
import { generatePixelDecisionMatrix } from './pixel-matrix';
import type { QRCodeInstance, QRGeneratorConfig } from '../../../modules/qr-generator/types';
import { buildScaledPreserveFlags } from './scaled-render-helpers/build-scaled-preserve-flags';
import { classifyScaledOverlayMode } from './scaled-render-helpers/classify-scaled-overlay-mode';
import { computeDitherBackdropParams } from './scaled-render-helpers/compute-dither-backdrop-params';
import { computeDitherDotParams } from './scaled-render-helpers/compute-dither-dot-params';
import { computeScaledLocalVariance } from './scaled-render-helpers/compute-scaled-local-variance';
import { computeSubpixelToneParams } from './scaled-render-helpers/compute-subpixel-tone-params';
import { shouldForceScaledBinaryModule } from './scaled-render-helpers/should-force-scaled-binary-module';
import {
  drawScaledDitherBackdrop,
  drawScaledPatternContrastBoostOverlay,
  drawScaledStrictFunctionOverlay,
  enforceScaledQuietZoneClean,
  renderScaledPixelGrid,
} from './scaled-render-helpers/scaled-pixel-grid';
import {
  applyModuleShapeMask,
  drawPreservedStructuralPatterns,
  getScaledFunctionalMap,
} from './scaled-render-helpers/scaled-structure';
import type { ContrastBoostFlags } from './scaled-render-types';
import { validateColor } from '../../../modules/qr-generator/utils';
import { hash01 } from './hash01';
import { scaledRenderLog as log } from './scaled-render-log';

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
