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

import { registerCacheCleanup } from "../../../modules/qr-generator/cache";
import { buildRenderCellCtx } from "./build-render-cell-ctx";
import { computeModuleGap } from "./compute-module-gap";
import { processRenderCell } from "./process-render-cell";
import {
  canUseFastPath,
  clearFunctionalMapCache,
  getCachedFunctionalMap,
  renderModulesFastPath,
} from "./render-loop-fast-path";
import type { RenderModulesOptions } from "../../../modules/qr-generator/types";
import type { ModuleDrawContext } from "./module-draw-context.types";
import type { RenderCellCtx } from "./render-cell-ctx.types";
import type { RenderCellState } from "./render-cell.types";
import { validateColor } from "../../../modules/qr-generator/utils";
export { clearFunctionalMapCache } from "./render-loop-fast-path";

// Register with central cache clearer (avoids circular import from cache.ts)
registerCacheCleanup(clearFunctionalMapCache);

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
  const effectiveBgColor = validateColor(config.bgColor, "#ffffff");
  const effectiveFgColor = validateColor(config.fgColor, "#000000");
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
      needsExplicitLightModules,
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
    !isFastPreview && config.overlayMode === "halftone-dithered";
  const moduleDrawCtx: ModuleDrawContext = {
    ctx,
    config,
    isFastPreview,
    cornerRadius: config.cornerRadius || 0,
    dotRotation: config.dotRotationDeg || 0,
    timingStyle: config.timingStyle || "match_module",
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
    gap,
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
