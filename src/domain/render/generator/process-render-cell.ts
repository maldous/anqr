import { applyPixelSnap } from "./apply-pixel-snap";
import { computeFinalModuleColor } from "./compute-final-module-color";
import {
  drawModuleHalftone,
  drawModuleOutline,
  drawModuleStandard,
  drawModuleTiming,
} from "./draw-styled-module";
import {
  PATTERN_ALIGNMENT,
  PATTERN_FINDER,
  PATTERN_FORMAT,
  PATTERN_TIMING,
  PATTERN_VERSION,
} from "./render-loop-fast-path";
import { getOverlayBrightness } from "../overlay/overlay-data-packed";
import { applyQROverlayMode } from "./render-modes";
import type { RenderCellCtx } from "./render-cell-ctx.types";
import type { RenderCellState } from "./render-cell.types";
import { shouldApplyOverlayToModule } from "./should-apply-overlay-to-module";

export function processRenderCell(
  rctx: RenderCellCtx,
  row: number,
  col: number,
  idx: number,
  state: RenderCellState,
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
    isVersion,
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
          rctx.hasContrastGuard,
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

  if (drawOutlineOnly || (rctx.moduleDrawCtx.isStrokeGapMode && isDark)) {
    drawModuleOutline(rctx.moduleDrawCtx, drawX, drawY, adjustedSize, finalModuleColor);
  } else if (useHalftoneRendering && !rctx.moduleDrawCtx.isFastPreview) {
    drawModuleHalftone(
      rctx.moduleDrawCtx,
      drawX,
      drawY,
      adjustedSize,
      isDark,
      halftoneBrightness,
      moduleFillStyle,
      row,
      col,
    );
  } else if (isTiming) {
    drawModuleTiming(rctx.moduleDrawCtx, drawX, drawY, adjustedSize);
  } else {
    drawModuleStandard(rctx.moduleDrawCtx, drawX, drawY, adjustedSize);
  }
}
