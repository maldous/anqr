/**
 * Module Render Loop
 * Renders all QR modules with styling and overlay effects
 *
 * Performance-optimised for Android WebView:
 *  - Per-module ctx.save()/restore() replaced with tracked globalAlpha
 *  - Set<string> pattern skipping replaced with Uint8Array (no string allocs)
 *  - Functional-pattern map precomputed once (no per-cell function calls)
 *  - Loop-invariant computations hoisted out of the double loop
 */

import { registerCacheCleanup } from '../../../modules/qr-generator/cache';
import {
  applyPaletteColor,
  applyPerModuleColor,
  ensureContrast,
} from '../../../modules/qr-generator/color';
import { drawHalftoneModule, drawModule, drawTimingModule } from './drawing';
import { getOverlayBrightness, getOverlayColorPacked } from '../overlay/overlay-data-packed';
import { getAlignmentPositionsCached } from './pattern-helpers';
import { applyQROverlayMode } from './render-modes';
import type {
  OverlayData,
  QRCodeInstance,
  QRGeneratorConfig,
  RenderModulesOptions,
} from '../../../modules/qr-generator/types';
import { validateColor } from '../../../modules/qr-generator/utils';

type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// Last-value cache for the functional pattern map.
// During animation the moduleCount and version stay constant across frames,
// so a single-entry cache avoids rebuilding the Uint8Array every frame.
let _fmCachedModuleCount = 0;
let _fmCachedVersion = 0;
let _fmCachedMap: Uint8Array | null = null;

function getCachedFunctionalMap(moduleCount: number, version: number): Uint8Array {
  if (
    _fmCachedMap !== null &&
    moduleCount === _fmCachedModuleCount &&
    version === _fmCachedVersion
  ) {
    return _fmCachedMap;
  }
  const map = buildFunctionalMap(moduleCount, version);
  _fmCachedModuleCount = moduleCount;
  _fmCachedVersion = version;
  _fmCachedMap = map;
  return map;
}

export function clearFunctionalMapCache(): void {
  _fmCachedModuleCount = 0;
  _fmCachedVersion = 0;
  _fmCachedMap = null;
}

// Register with central cache clearer (avoids circular import from cache.ts)
registerCacheCleanup(clearFunctionalMapCache);

// Pattern flag constants for precomputed functional map (bit flags)
const PATTERN_FINDER = 1;
const PATTERN_TIMING = 2;
const PATTERN_ALIGNMENT = 4;
const PATTERN_FORMAT = 8;
const PATTERN_VERSION = 16;
const PATTERN_FIXED_DARK = 32;

/**
 * Build a Uint8Array classifying each QR module by structural role.
 * Replaces per-cell isFinderPattern/isTimingPattern/… function calls
 * with a single array read in the hot render loop.
 */
function markFinderPatterns(map: Uint8Array, mc: number): void {
  const finderStarts: [number, number][] = [
    [0, 0],
    [0, mc - 7],
    [mc - 7, 0],
  ];
  for (const [sr, sc] of finderStarts) {
    const rEnd = Math.min(sr + 7, mc);
    const cEnd = Math.min(sc + 7, mc);
    for (let r = sr; r < rEnd; r++) {
      const rowBase = r * mc;
      for (let c = sc; c < cEnd; c++) {
        map[rowBase + c] |= PATTERN_FINDER;
      }
    }
  }
}

function markTimingPatterns(map: Uint8Array, mc: number): void {
  for (let i = 8; i < mc - 8; i++) {
    map[6 * mc + i] |= PATTERN_TIMING;
    map[i * mc + 6] |= PATTERN_TIMING;
  }
}

function markAlignmentPatterns(map: Uint8Array, mc: number, version: number): void {
  if (version < 2) return;
  const centers = getAlignmentPositionsCached(version, mc);
  for (const center of centers) {
    for (let dr = -2; dr <= 2; dr++) {
      const r = center.row + dr;
      if (r < 0 || r >= mc) continue;
      const rowBase = r * mc;
      for (let dc = -2; dc <= 2; dc++) {
        const c = center.col + dc;
        if (c >= 0 && c < mc) {
          map[rowBase + c] |= PATTERN_ALIGNMENT;
        }
      }
    }
  }
}

function markFormatInfo(map: Uint8Array, mc: number): void {
  const row8 = 8 * mc;
  for (let c = 0; c <= 5; c++) map[row8 + c] |= PATTERN_FORMAT;
  map[row8 + 7] |= PATTERN_FORMAT;
  map[row8 + 8] |= PATTERN_FORMAT;
  for (let c = mc - 8; c < mc; c++) map[row8 + c] |= PATTERN_FORMAT;
  for (let r = 0; r <= 5; r++) map[r * mc + 8] |= PATTERN_FORMAT;
  map[7 * mc + 8] |= PATTERN_FORMAT;
  for (let r = mc - 7; r < mc; r++) map[r * mc + 8] |= PATTERN_FORMAT;
}

function markVersionInfo(map: Uint8Array, mc: number, version: number): void {
  if (version < 7) return;
  for (let r = 0; r < 6; r++) {
    const rowBase = r * mc;
    for (let c = mc - 11; c < mc - 8; c++) {
      map[rowBase + c] |= PATTERN_VERSION;
    }
  }
  for (let r = mc - 11; r < mc - 8; r++) {
    const rowBase = r * mc;
    for (let c = 0; c < 6; c++) {
      map[rowBase + c] |= PATTERN_VERSION;
    }
  }
}

function buildFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const mc = moduleCount;
  const map = new Uint8Array(mc * mc);

  markFinderPatterns(map, mc);
  markTimingPatterns(map, mc);
  markAlignmentPatterns(map, mc, version);
  markFormatInfo(map, mc);
  markVersionInfo(map, mc, version);

  if (mc > 8) {
    map[(mc - 8) * mc + 8] |= PATTERN_FIXED_DARK;
  }

  return map;
}

/**
 * Check whether the fast-path batch renderer can be used.
 * Returns true when all modules are plain squares that can be drawn with
 * run-length encoded fillRect calls (no per-module path ops, no overlay,
 * no pattern classification needed).
 */
function canUseFastPath(config: QRGeneratorConfig, hasOverlayData: boolean, gap: number): boolean {
  const style = config.moduleStyle || 'square';
  if (style !== 'square') return false;
  if ((config.cornerRadius || 0) > 0) return false;
  if ((config.dotRotationDeg || 0) !== 0) return false;
  if (hasOverlayData) return false;
  if (config.gapMode === 'stroke') return false;
  if (gap > 0) return false;
  // In fast preview mode, remaining checks (jitter, timing, palette, contrast) are skipped
  // because these features are stripped for responsive interaction on Android
  if (config.fastPreview) return true;
  if ((config.moduleJitterPx || 0) > 0) return false;
  const ts = config.timingStyle || 'match_module';
  if (ts !== 'match_module' && ts !== 'square') return false;
  if (config.palette && config.palette.length > 0) return false;
  if (config.contrastGuard && config.minContrastRatio) return false;
  return true;
}

/**
 * Fast-path renderer using run-length encoded fillRect.
 *
 * For each row, consecutive dark (or light) non-skipped modules are merged
 * into a single wide fillRect call. This eliminates:
 *  - Per-module function calls (drawModule + switch)
 *  - Pattern classification lookups (buildFunctionalMap not needed)
 *  - Canvas state changes (no save/restore, no per-module fillStyle)
 *
 * Typically reduces draw calls from O(moduleCount²) to O(moduleCount × runs).
 */
function isRunLengthCellMatch(
  qr: QRCodeInstance,
  ditherPattern: boolean[][] | null,
  skipMask: Uint8Array,
  rowBase: number,
  row: number,
  col: number,
  moduleCount: number,
  isDarkPass: boolean
): boolean {
  if (col >= moduleCount || skipMask[rowBase + col]) return false;
  const cellIsDark = ditherPattern ? ditherPattern[row][col] : qr.isDark(row, col);
  return isDarkPass ? cellIsDark : !cellIsDark;
}

function renderRunLengthPass(
  ctx: CanvasContext,
  qr: QRCodeInstance,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  ditherPattern: boolean[][] | null,
  skipMask: Uint8Array,
  isDarkPass: boolean
): void {
  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;
    const y = (row + margin) * moduleSize;
    let runStart = -1;

    for (let col = 0; col <= moduleCount; col++) {
      const match = isRunLengthCellMatch(
        qr,
        ditherPattern,
        skipMask,
        rowBase,
        row,
        col,
        moduleCount,
        isDarkPass
      );

      if (match) {
        if (runStart === -1) runStart = col;
      } else if (runStart !== -1) {
        ctx.fillRect(
          (runStart + margin) * moduleSize,
          y,
          (col - runStart) * moduleSize,
          moduleSize
        );
        runStart = -1;
      }
    }
  }
}

function renderModulesFastPath(
  ctx: CanvasContext,
  qr: QRCodeInstance,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  ditherPattern: boolean[][] | null,
  skipMask: Uint8Array,
  fgFill: string | CanvasGradient,
  bgColor: string,
  needsExplicitLightModules: boolean
): void {
  ctx.fillStyle = fgFill;
  renderRunLengthPass(ctx, qr, moduleCount, moduleSize, margin, ditherPattern, skipMask, true);

  if (needsExplicitLightModules) {
    ctx.fillStyle = bgColor;
    renderRunLengthPass(ctx, qr, moduleCount, moduleSize, margin, ditherPattern, skipMask, false);
  }
}

interface ModuleDrawContext {
  ctx: CanvasContext;
  config: QRGeneratorConfig;
  isFastPreview: boolean;
  cornerRadius: number;
  dotRotation: number;
  timingStyle: string;
  isStrokeGapMode: boolean;
  strokeWidth: number;
  overlayModeIsHalftoneDithered: boolean;
  overlayData: OverlayData | null;
  setFillStyle: (fill: string | CanvasGradient) => void;
}

function computeFinalModuleColor(
  baseColor: string,
  isDark: boolean,
  overlayBrightness: number,
  overlayData: OverlayData | null,
  row: number,
  col: number,
  moduleCount: number,
  config: QRGeneratorConfig,
  hasPerModuleColor: boolean,
  hasPalette: boolean,
  hasContrastGuard: boolean
): string {
  let finalColor = baseColor;
  if (isDark && hasPerModuleColor && overlayData) {
    finalColor = applyPerModuleColor(
      config.perModuleColorMode!,
      finalColor,
      overlayData,
      row,
      col,
      moduleCount,
      config
    );
  }
  if (isDark && hasPalette) {
    finalColor = applyPaletteColor(
      row,
      col,
      moduleCount,
      overlayBrightness,
      config.palette!,
      config
    );
  }
  if (isDark && hasContrastGuard) {
    finalColor = ensureContrast(finalColor, config.bgColor, config.minContrastRatio!);
  }
  return finalColor;
}

function drawHalftoneDitheredBackground(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
  isDark: boolean,
  moduleFillStyle: string | CanvasGradient,
  row: number,
  col: number
): void {
  const cellColor = getOverlayColorPacked(dctx.overlayData, row, col);
  if (!cellColor) return;
  const cellR = (cellColor >> 16) & 0xff;
  const cellG = (cellColor >> 8) & 0xff;
  const cellB = cellColor & 0xff;
  if (isDark) {
    const darkBackdrop = 0.5;
    const backR = Math.round(cellR * darkBackdrop);
    const backG = Math.round(cellG * darkBackdrop);
    const backB = Math.round(cellB * darkBackdrop);
    dctx.setFillStyle(`rgb(${backR},${backG},${backB})`);
  } else {
    const lightBlend = 0.46;
    const backR = Math.round(cellR + (255 - cellR) * lightBlend);
    const backG = Math.round(cellG + (255 - cellG) * lightBlend);
    const backB = Math.round(cellB + (255 - cellB) * lightBlend);
    dctx.setFillStyle(`rgb(${backR},${backG},${backB})`);
  }
  dctx.ctx.fillRect(drawX, drawY, adjustedSize, adjustedSize);
  dctx.setFillStyle(moduleFillStyle);
}

function drawStyledModule(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
  isDark: boolean,
  isTiming: boolean,
  drawOutlineOnly: boolean,
  useHalftoneRendering: boolean,
  halftoneBrightness: number,
  finalModuleColor: string,
  moduleFillStyle: string | CanvasGradient,
  row: number,
  col: number
): void {
  if (drawOutlineOnly || (dctx.isStrokeGapMode && isDark)) {
    dctx.ctx.strokeStyle = finalModuleColor;
    dctx.ctx.lineWidth = dctx.strokeWidth || 1;
    dctx.ctx.strokeRect(
      drawX + dctx.ctx.lineWidth / 2,
      drawY + dctx.ctx.lineWidth / 2,
      adjustedSize - dctx.ctx.lineWidth,
      adjustedSize - dctx.ctx.lineWidth
    );
  } else if (useHalftoneRendering && !dctx.isFastPreview) {
    if (dctx.overlayModeIsHalftoneDithered) {
      drawHalftoneDitheredBackground(
        dctx,
        drawX,
        drawY,
        adjustedSize,
        isDark,
        moduleFillStyle,
        row,
        col
      );
    }
    drawHalftoneModule(
      dctx.ctx as CanvasRenderingContext2D,
      drawX,
      drawY,
      adjustedSize,
      halftoneBrightness,
      dctx.config,
      row,
      col
    );
  } else if (isTiming) {
    drawTimingModule(
      dctx.ctx as CanvasRenderingContext2D,
      drawX,
      drawY,
      adjustedSize,
      dctx.timingStyle,
      dctx.config
    );
  } else {
    drawModule(
      dctx.ctx as CanvasRenderingContext2D,
      drawX,
      drawY,
      adjustedSize,
      dctx.config.moduleStyle,
      {
        cornerRadius: dctx.cornerRadius,
        rotation: dctx.dotRotation,
      }
    );
  }
}

const _snapResult = { x: 0, y: 0 };
function applyPixelSnap(x: number, y: number, pixelSnap: string): { x: number; y: number } {
  if (pixelSnap === 'floor') {
    _snapResult.x = Math.floor(x);
    _snapResult.y = Math.floor(y);
  } else if (pixelSnap === 'round') {
    _snapResult.x = Math.round(x);
    _snapResult.y = Math.round(y);
  } else if (pixelSnap === 'ceil') {
    _snapResult.x = Math.ceil(x);
    _snapResult.y = Math.ceil(y);
  } else {
    _snapResult.x = x;
    _snapResult.y = y;
  }
  return _snapResult;
}

function computeModuleGap(
  config: QRGeneratorConfig,
  moduleSize: number
): { gap: number; strokeWidth: number; isStrokeGapMode: boolean } {
  const baseGap = config.moduleGap ? (moduleSize * config.moduleGap) / 100 : 0;
  const gapMode = config.gapMode || 'none';
  let gap = baseGap;
  let strokeWidth = 0;
  if (gapMode === 'inset') {
    gap = Math.max(baseGap, moduleSize * 0.1);
  } else if (gapMode === 'stroke') {
    strokeWidth = Math.max(1, moduleSize * 0.15);
    gap = strokeWidth;
  } else if (gapMode === 'negative_space') {
    gap = Math.max(baseGap, moduleSize * 0.2);
  }
  return { gap, strokeWidth, isStrokeGapMode: gapMode === 'stroke' };
}

interface RenderCellCtx {
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  moduleCount: number;
  moduleSize: number;
  margin: number;
  overlayData: OverlayData | null;
  ditherPattern: boolean[][] | null;
  effectiveIntensity: number;
  functionalMap: Uint8Array;
  moduleDrawCtx: ModuleDrawContext;
  effectiveFgColor: string;
  effectiveBgColor: string;
  needsExplicitLightModules: boolean;
  hasOverlayData: boolean;
  preserveFinders: boolean | undefined;
  preserveTiming: boolean | undefined;
  preserveAlignment: boolean | undefined;
  protectFormat: boolean | undefined;
  protectVersion: boolean | undefined;
  hasPerModuleColor: boolean;
  hasPalette: boolean;
  hasContrastGuard: boolean;
  hasJitter: boolean;
  jitterPx: number;
  frameIndex: number;
  pixelSnap: string;
  gap: number;
  isFastPreview: boolean;
  useGradient: boolean;
  gradientFill: CanvasGradient | null | undefined;
}

interface RenderCellState {
  currentAlpha: number;
  currentFillStyle: string | CanvasGradient | null;
}

function shouldApplyOverlayToModule(
  rctx: RenderCellCtx,
  isFinder: boolean,
  isTiming: boolean,
  isAlignment: boolean,
  isFormat: boolean,
  isVersion: boolean
): boolean {
  return (
    rctx.hasOverlayData &&
    !(rctx.preserveFinders && isFinder) &&
    !(rctx.preserveTiming && isTiming) &&
    !(rctx.preserveAlignment && isAlignment) &&
    !(rctx.protectFormat && isFormat) &&
    !(rctx.protectVersion && isVersion)
  );
}

function processRenderCell(
  rctx: RenderCellCtx,
  row: number,
  col: number,
  idx: number,
  state: RenderCellState
): void {
  const isDark = rctx.ditherPattern ? rctx.ditherPattern[row][col] : rctx.qr.isDark(row, col);
  const x = (col + rctx.margin) * rctx.moduleSize;
  const y = (row + rctx.margin) * rctx.moduleSize;

  const flags = rctx.functionalMap[idx];
  const isFinder = (flags & PATTERN_FINDER) !== 0;
  const isTiming = (flags & PATTERN_TIMING) !== 0;
  const isAlignment = (flags & PATTERN_ALIGNMENT) !== 0;
  const isFormat = (flags & PATTERN_FORMAT) !== 0;
  const isVersion = (flags & PATTERN_VERSION) !== 0;
  const isFunctionalPattern = flags !== 0;

  const applyOverlay = shouldApplyOverlayToModule(
    rctx,
    isFinder,
    isTiming,
    isAlignment,
    isFormat,
    isVersion
  );

  let moduleColor = isDark ? rctx.effectiveFgColor : rctx.effectiveBgColor;
  let moduleSizeModifier = 1;
  let moduleOpacity = 1;
  let waveOffsetX = 0;
  let waveOffsetY = 0;
  let drawOutlineOnly = false;
  let useHalftoneRendering = false;
  let halftoneBrightness = 0.5;
  let shouldDrawCell = isDark || rctx.needsExplicitLightModules;
  const overlayBrightness = rctx.hasOverlayData
    ? getOverlayBrightness(rctx.overlayData, row, col)
    : 0.5;

  if (applyOverlay) {
    const modeResult = applyQROverlayMode({
      overlayMode: rctx.config.overlayMode,
      isDark,
      brightness: overlayBrightness,
      overlayData: rctx.overlayData!,
      row,
      col,
      moduleCount: rctx.moduleCount,
      effectiveIntensity: rctx.effectiveIntensity,
      config: rctx.config,
      isFunctionalPattern,
    });

    moduleColor = modeResult.moduleColor;
    moduleSizeModifier = modeResult.moduleSizeModifier;
    moduleOpacity = modeResult.moduleOpacity;
    waveOffsetX = modeResult.waveOffsetX;
    waveOffsetY = modeResult.waveOffsetY;
    drawOutlineOnly = modeResult.drawOutlineOnly;
    useHalftoneRendering = modeResult.useHalftoneRendering;
    halftoneBrightness = modeResult.halftoneBrightness;
    shouldDrawCell = modeResult.shouldDrawCell || rctx.needsExplicitLightModules;
  }

  if (!shouldDrawCell || moduleOpacity <= 0) return;

  if (moduleOpacity !== state.currentAlpha) {
    rctx.moduleDrawCtx.ctx.globalAlpha = moduleOpacity;
    state.currentAlpha = moduleOpacity;
  }

  const finalModuleColor =
    rctx.hasPerModuleColor || rctx.hasPalette || rctx.hasContrastGuard
      ? computeFinalModuleColor(
          moduleColor,
          isDark,
          overlayBrightness,
          rctx.overlayData,
          row,
          col,
          rctx.moduleCount,
          rctx.config,
          rctx.hasPerModuleColor,
          rctx.hasPalette,
          rctx.hasContrastGuard
        )
      : moduleColor;

  const moduleFillStyle: string | CanvasGradient =
    isDark && !rctx.isFastPreview && rctx.useGradient && rctx.gradientFill
      ? rctx.gradientFill
      : finalModuleColor;
  rctx.moduleDrawCtx.setFillStyle(moduleFillStyle);

  const adjustedSize = (rctx.moduleSize - rctx.gap) * moduleSizeModifier;
  const offset = (rctx.moduleSize - adjustedSize) / 2;

  let drawX = x + offset + waveOffsetX;
  let drawY = y + offset + waveOffsetY;

  if (rctx.hasJitter) {
    const jitterSeed = (row * 31 + col * 17 + rctx.frameIndex * 13) % 1000;
    const jitterX = ((jitterSeed % 100) / 100 - 0.5) * 2 * rctx.jitterPx;
    const jitterY = (((jitterSeed * 7) % 100) / 100 - 0.5) * 2 * rctx.jitterPx;
    drawX += jitterX;
    drawY += jitterY;
  }

  const snapped = applyPixelSnap(drawX, drawY, rctx.pixelSnap);
  drawX = snapped.x;
  drawY = snapped.y;

  drawStyledModule(
    rctx.moduleDrawCtx,
    drawX,
    drawY,
    adjustedSize,
    isDark,
    isTiming,
    drawOutlineOnly,
    useHalftoneRendering,
    halftoneBrightness,
    finalModuleColor,
    moduleFillStyle,
    row,
    col
  );
}

function buildRenderCellCtx(
  options: RenderModulesOptions,
  isFastPreview: boolean,
  effectiveFgColor: string,
  effectiveBgColor: string,
  needsExplicitLightModules: boolean,
  hasOverlayData: boolean,
  functionalMap: Uint8Array,
  moduleDrawCtx: ModuleDrawContext,
  gap: number
): RenderCellCtx {
  const {
    qr,
    config,
    moduleCount,
    moduleSize,
    margin,
    overlayData,
    ditherPattern,
    effectiveIntensity,
    gradientFill,
    useGradient,
  } = options;
  return {
    qr,
    config,
    moduleCount,
    moduleSize,
    margin,
    overlayData,
    ditherPattern,
    effectiveIntensity,
    functionalMap,
    moduleDrawCtx,
    effectiveFgColor,
    effectiveBgColor,
    needsExplicitLightModules,
    hasOverlayData,
    preserveFinders: config.preserveFinders,
    preserveTiming: config.preserveTiming,
    preserveAlignment: config.preserveAlignment,
    protectFormat: config.protectFormatInfo,
    protectVersion: config.protectVersionInfo,
    hasPerModuleColor:
      !isFastPreview &&
      !!config.perModuleColorMode &&
      config.perModuleColorMode !== 'solid' &&
      hasOverlayData,
    hasPalette: !isFastPreview && !!(config.palette && config.palette.length > 0),
    hasContrastGuard: !isFastPreview && !!(config.contrastGuard && config.minContrastRatio),
    hasJitter: !isFastPreview && !!(config.moduleJitterPx && config.moduleJitterPx > 0),
    jitterPx: isFastPreview ? 0 : config.moduleJitterPx || 0,
    frameIndex: config.frameIndex || 0,
    pixelSnap: config.pixelSnap || 'floor',
    gap,
    isFastPreview,
    useGradient: useGradient === true,
    gradientFill,
  };
}

/**
 * Render all QR modules with styling and overlay effects
 */
export function renderModules(options: RenderModulesOptions): void {
  const {
    ctx,
    qr,
    config,
    moduleCount,
    moduleSize,
    margin,
    overlayData,
    ditherPattern,
    skipMask,
    version,
    gradientFill,
    useGradient,
  } = options;
  const isFastPreview = config.fastPreview === true;
  const effectiveBgColor = validateColor(config.bgColor, '#ffffff');
  const effectiveFgColor = validateColor(config.fgColor, '#000000');
  const needsExplicitLightModules = config.transparentBg === true;
  const hasOverlayData = overlayData !== null;

  const { gap, strokeWidth, isStrokeGapMode } = computeModuleGap(config, moduleSize);

  if (canUseFastPath(config, hasOverlayData, gap)) {
    const fgFill: string | CanvasGradient =
      useGradient && gradientFill ? gradientFill : effectiveFgColor;
    renderModulesFastPath(
      ctx,
      qr,
      moduleCount,
      moduleSize,
      margin,
      ditherPattern,
      skipMask,
      fgFill,
      effectiveBgColor,
      needsExplicitLightModules
    );
    return;
  }

  const functionalMap = getCachedFunctionalMap(moduleCount, version);

  const state: RenderCellState = {
    currentAlpha: ctx.globalAlpha,
    currentFillStyle: null,
  };
  const setFillStyle = (fillStyle: string | CanvasGradient): void => {
    if (state.currentFillStyle === fillStyle) return;
    ctx.fillStyle = fillStyle;
    state.currentFillStyle = fillStyle;
  };

  const overlayModeIsHalftoneDithered =
    !isFastPreview && config.overlayMode === 'halftone-dithered';
  const moduleDrawCtx: ModuleDrawContext = {
    ctx,
    config,
    isFastPreview,
    cornerRadius: config.cornerRadius || 0,
    dotRotation: config.dotRotationDeg || 0,
    timingStyle: config.timingStyle || 'match_module',
    isStrokeGapMode,
    strokeWidth,
    overlayModeIsHalftoneDithered,
    overlayData,
    setFillStyle,
  };

  const rctx: RenderCellCtx = buildRenderCellCtx(
    options,
    isFastPreview,
    effectiveFgColor,
    effectiveBgColor,
    needsExplicitLightModules,
    hasOverlayData,
    functionalMap,
    moduleDrawCtx,
    gap
  );

  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;
    for (let col = 0; col < moduleCount; col++) {
      const idx = rowBase + col;
      if (skipMask[idx]) continue;
      processRenderCell(rctx, row, col, idx, state);
    }
  }

  if (state.currentAlpha !== 1) {
    ctx.globalAlpha = 1;
  }
}
