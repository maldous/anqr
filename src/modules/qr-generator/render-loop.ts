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

import { registerCacheCleanup } from './cache';
import { applyPaletteColor, applyPerModuleColor, ensureContrast } from './color';
import { drawHalftoneModule, drawModule, drawTimingModule } from './drawing';
import { getOverlayBrightness, getOverlayColorPacked } from './overlay-data-packed';
import { getAlignmentPositionsCached } from './pattern-helpers';
import { applyQROverlayMode } from './render-modes';
import type { OverlayData, QRCodeInstance, QRGeneratorConfig } from './types';
import { validateColor } from './utils';

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
function buildFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const mc = moduleCount;
  const map = new Uint8Array(mc * mc);

  // Finder patterns (7×7 at three corners)
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

  // Timing patterns (row 6 and col 6, between finders)
  for (let i = 8; i < mc - 8; i++) {
    map[6 * mc + i] |= PATTERN_TIMING;
    map[i * mc + 6] |= PATTERN_TIMING;
  }

  // Alignment patterns (version ≥ 2)
  if (version >= 2) {
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

  // Format info – specific sparse positions (row 8 and col 8)
  const row8 = 8 * mc;
  for (let c = 0; c <= 5; c++) map[row8 + c] |= PATTERN_FORMAT;
  map[row8 + 7] |= PATTERN_FORMAT;
  map[row8 + 8] |= PATTERN_FORMAT;
  for (let c = mc - 8; c < mc; c++) map[row8 + c] |= PATTERN_FORMAT;
  for (let r = 0; r <= 5; r++) map[r * mc + 8] |= PATTERN_FORMAT;
  map[7 * mc + 8] |= PATTERN_FORMAT;
  for (let r = mc - 7; r < mc; r++) map[r * mc + 8] |= PATTERN_FORMAT;

  // Version info (version ≥ 7)
  if (version >= 7) {
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

  // Fixed dark module
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
  // Dark modules — one fillStyle set, then batch fillRect per row
  ctx.fillStyle = fgFill;

  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;
    const y = (row + margin) * moduleSize;
    let runStart = -1;

    for (let col = 0; col <= moduleCount; col++) {
      const dark =
        col < moduleCount &&
        !skipMask[rowBase + col] &&
        (ditherPattern ? ditherPattern[row][col] : qr.isDark(row, col));

      if (dark) {
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

  // Light modules — only needed when background is transparent
  if (needsExplicitLightModules) {
    ctx.fillStyle = bgColor;

    for (let row = 0; row < moduleCount; row++) {
      const rowBase = row * moduleCount;
      const y = (row + margin) * moduleSize;
      let runStart = -1;

      for (let col = 0; col <= moduleCount; col++) {
        const light =
          col < moduleCount &&
          !skipMask[rowBase + col] &&
          !(ditherPattern ? ditherPattern[row][col] : qr.isDark(row, col));

        if (light) {
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
}

/**
 * Render all QR modules with styling and overlay effects
 */
export function renderModules(
  ctx: CanvasContext,
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  overlayData: OverlayData | null,
  ditherPattern: boolean[][] | null,
  effectiveIntensity: number,
  skipMask: Uint8Array,
  version: number,
  gradientFill: CanvasGradient | null,
  useGradient: boolean
): void {
  // === HOISTED LOOP-INVARIANT COMPUTATIONS ===
  const isFastPreview = config.fastPreview === true;
  const cornerRadius = config.cornerRadius || 0;
  const dotRotation = config.dotRotationDeg || 0;
  const timingStyle = config.timingStyle || 'match_module';
  const effectiveBgColor = validateColor(config.bgColor, '#ffffff');
  const effectiveFgColor = validateColor(config.fgColor, '#000000');
  const needsExplicitLightModules = config.transparentBg === true;
  const protectFormat = config.protectFormatInfo;
  const protectVersion = config.protectVersionInfo;
  const preserveFinders = config.preserveFinders;
  const preserveTiming = config.preserveTiming;
  const preserveAlignment = config.preserveAlignment;
  const hasOverlayData = overlayData !== null;
  const overlayModeIsHalftoneDithered =
    !isFastPreview && config.overlayMode === 'halftone-dithered';
  // In fast preview mode, skip expensive per-module color/palette/contrast/jitter
  const hasPerModuleColor =
    !isFastPreview &&
    !!config.perModuleColorMode &&
    config.perModuleColorMode !== 'solid' &&
    hasOverlayData;
  const hasPalette = !isFastPreview && !!(config.palette && config.palette.length > 0);
  const hasContrastGuard = !isFastPreview && !!(config.contrastGuard && config.minContrastRatio);
  const hasJitter = !isFastPreview && !!(config.moduleJitterPx && config.moduleJitterPx > 0);
  const jitterPx = isFastPreview ? 0 : config.moduleJitterPx || 0;
  const frameIndex = config.frameIndex || 0;
  const pixelSnap = config.pixelSnap || 'floor';

  // Precompute gap settings (constant for all modules)
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
  const isStrokeGapMode = gapMode === 'stroke';

  // === FAST PATH: batch fillRect with run-length encoding ===
  // When modules are simple squares with no per-module effects, skip the
  // expensive functional-pattern map and per-cell overhead entirely.
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

  // === FULL PATH: per-module styling with overlay/pattern support ===

  // Build functional pattern map once (cached across frames for animation)
  const functionalMap = getCachedFunctionalMap(moduleCount, version);

  // Tracked canvas state (replaces per-module ctx.save/restore)
  let currentAlpha = ctx.globalAlpha;
  let currentFillStyle: string | CanvasGradient | null = null;
  const setFillStyle = (fillStyle: string | CanvasGradient): void => {
    if (currentFillStyle === fillStyle) return;
    ctx.fillStyle = fillStyle;
    currentFillStyle = fillStyle;
  };

  // Draw QR modules
  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;
    for (let col = 0; col < moduleCount; col++) {
      const idx = rowBase + col;

      // Skip already-drawn structural patterns (Uint8Array lookup – no string allocs)
      if (skipMask[idx]) continue;

      // Use dithered pattern if available, otherwise use original QR
      const isDark = ditherPattern ? ditherPattern[row][col] : qr.isDark(row, col);
      const x = (col + margin) * moduleSize;
      const y = (row + margin) * moduleSize;

      // Pattern classification from precomputed map (array read, not function calls)
      const flags = functionalMap[idx];
      const isFinder = (flags & PATTERN_FINDER) !== 0;
      const isTiming = (flags & PATTERN_TIMING) !== 0;
      const isAlignment = (flags & PATTERN_ALIGNMENT) !== 0;
      const isFormat = (flags & PATTERN_FORMAT) !== 0;
      const isVersion = (flags & PATTERN_VERSION) !== 0;
      const isFunctionalPattern = flags !== 0;

      const applyOverlay =
        hasOverlayData &&
        !(preserveFinders && isFinder) &&
        !(preserveTiming && isTiming) &&
        !(preserveAlignment && isAlignment) &&
        !(protectFormat && isFormat) &&
        !(protectVersion && isVersion);

      // Default rendering parameters
      let moduleColor = isDark ? effectiveFgColor : effectiveBgColor;
      let moduleSizeModifier = 1;
      let moduleOpacity = 1;
      let waveOffsetX = 0;
      let waveOffsetY = 0;
      let drawOutlineOnly = false;
      let useHalftoneRendering = false;
      let halftoneBrightness = 0.5;
      // Draw dark modules always; draw light modules only when background is transparent
      let shouldDrawCell = isDark || needsExplicitLightModules;
      const overlayBrightness = hasOverlayData ? getOverlayBrightness(overlayData, row, col) : 0.5;

      if (applyOverlay) {
        const modeResult = applyQROverlayMode(
          config.overlayMode,
          isDark,
          overlayBrightness,
          overlayData!,
          row,
          col,
          moduleCount,
          effectiveIntensity,
          config,
          isFunctionalPattern
        );

        moduleColor = modeResult.moduleColor;
        moduleSizeModifier = modeResult.moduleSizeModifier;
        moduleOpacity = modeResult.moduleOpacity;
        waveOffsetX = modeResult.waveOffsetX;
        waveOffsetY = modeResult.waveOffsetY;
        drawOutlineOnly = modeResult.drawOutlineOnly;
        useHalftoneRendering = modeResult.useHalftoneRendering;
        halftoneBrightness = modeResult.halftoneBrightness;
        // Preserve transparentBg requirement: if background is transparent, light modules must be drawn
        shouldDrawCell = modeResult.shouldDrawCell || needsExplicitLightModules;
      }

      if (shouldDrawCell && moduleOpacity > 0) {
        // Update globalAlpha only when changed (avoids per-module save/restore)
        if (moduleOpacity !== currentAlpha) {
          ctx.globalAlpha = moduleOpacity;
          currentAlpha = moduleOpacity;
        }

        // Apply per-module color mode
        let finalModuleColor = moduleColor;
        if (isDark && hasPerModuleColor) {
          finalModuleColor = applyPerModuleColor(
            config.perModuleColorMode!,
            moduleColor,
            overlayData!,
            row,
            col,
            moduleCount,
            config
          );
        }

        // Apply palette coloring if palette is provided
        if (isDark && hasPalette) {
          finalModuleColor = applyPaletteColor(
            row,
            col,
            moduleCount,
            overlayBrightness,
            config.palette!,
            config
          );
        }

        // Apply contrast guard if enabled
        if (isDark && hasContrastGuard) {
          finalModuleColor = ensureContrast(
            finalModuleColor,
            config.bgColor,
            config.minContrastRatio!
          );
        }

        // Use gradient for dark modules if configured (skipped in fast preview)
        const moduleFillStyle: string | CanvasGradient =
          isDark && !isFastPreview && useGradient && gradientFill ? gradientFill : finalModuleColor;
        setFillStyle(moduleFillStyle);

        const adjustedSize = (moduleSize - gap) * moduleSizeModifier;
        const offset = (moduleSize - adjustedSize) / 2;

        let drawX = x + offset + waveOffsetX;
        let drawY = y + offset + waveOffsetY;

        // Apply module jitter if configured (for animation effects)
        if (hasJitter) {
          const jitterSeed = (row * 31 + col * 17 + frameIndex * 13) % 1000;
          const jitterX = ((jitterSeed % 100) / 100 - 0.5) * 2 * jitterPx;
          const jitterY = (((jitterSeed * 7) % 100) / 100 - 0.5) * 2 * jitterPx;
          drawX += jitterX;
          drawY += jitterY;
        }

        // Apply pixel snap if configured
        if (pixelSnap === 'floor') {
          drawX = Math.floor(drawX);
          drawY = Math.floor(drawY);
        } else if (pixelSnap === 'round') {
          drawX = Math.round(drawX);
          drawY = Math.round(drawY);
        } else if (pixelSnap === 'ceil') {
          drawX = Math.ceil(drawX);
          drawY = Math.ceil(drawY);
        }

        // In fast preview, skip halftone rendering — fall through to simple module drawing
        if (drawOutlineOnly || (isStrokeGapMode && isDark)) {
          ctx.strokeStyle = finalModuleColor;
          ctx.lineWidth = strokeWidth || 1;
          ctx.strokeRect(
            drawX + ctx.lineWidth / 2,
            drawY + ctx.lineWidth / 2,
            adjustedSize - ctx.lineWidth,
            adjustedSize - ctx.lineWidth
          );
        } else if (useHalftoneRendering && !isFastPreview) {
          // In halftone-dithered mode, paint a color backdrop first so the
          // source image remains visible behind variable-size dots.
          if (overlayModeIsHalftoneDithered) {
            const cellColor = getOverlayColorPacked(overlayData, row, col);
            if (cellColor) {
              const cellR = (cellColor >> 16) & 0xff;
              const cellG = (cellColor >> 8) & 0xff;
              const cellB = cellColor & 0xff;
              if (isDark) {
                // Dark QR modules: keep backdrop moderately dark for contrast.
                const darkBackdrop = 0.5;
                const backR = Math.round(cellR * darkBackdrop);
                const backG = Math.round(cellG * darkBackdrop);
                const backB = Math.round(cellB * darkBackdrop);
                setFillStyle(`rgb(${backR},${backG},${backB})`);
              } else {
                // Light QR modules: brighten backdrop to preserve scan-safe separation.
                const lightBlend = 0.46;
                const backR = Math.round(cellR + (255 - cellR) * lightBlend);
                const backG = Math.round(cellG + (255 - cellG) * lightBlend);
                const backB = Math.round(cellB + (255 - cellB) * lightBlend);
                setFillStyle(`rgb(${backR},${backG},${backB})`);
              }
              ctx.fillRect(drawX, drawY, adjustedSize, adjustedSize);
              // Restore dot fill after backdrop pass.
              setFillStyle(moduleFillStyle);
            }
          }

          // Use advanced halftone rendering with htDot/htCurve params
          // Cast to CanvasRenderingContext2D for drawing functions (safe because we only use common 2D methods)
          // Pass row and col for line shape rotation variation
          drawHalftoneModule(
            ctx as CanvasRenderingContext2D,
            drawX,
            drawY,
            adjustedSize,
            halftoneBrightness,
            config,
            row,
            col
          );
        } else if (isTiming) {
          // Draw timing pattern module with timing style
          drawTimingModule(
            ctx as CanvasRenderingContext2D,
            drawX,
            drawY,
            adjustedSize,
            timingStyle,
            config
          );
        } else {
          drawModule(
            ctx as CanvasRenderingContext2D,
            drawX,
            drawY,
            adjustedSize,
            config.moduleStyle,
            {
              cornerRadius,
              rotation: dotRotation,
            }
          );
        }
      }
    }
  }

  // Restore globalAlpha after the loop (single call, not per-module)
  if (currentAlpha !== 1) {
    ctx.globalAlpha = 1;
  }
}
