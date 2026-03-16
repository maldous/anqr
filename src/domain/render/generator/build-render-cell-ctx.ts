import type { RenderModulesOptions } from "../../../modules/qr-generator/types";
import type { ModuleDrawContext } from "./module-draw-context.interface";
import type { RenderCellCtx } from "./render-cell-ctx.interface";

export function buildRenderCellCtx(
  options: RenderModulesOptions,
  isFastPreview: boolean,
  effectiveFgColor: string,
  effectiveBgColor: string,
  needsExplicitLightModules: boolean,
  hasOverlayData: boolean,
  functionalMap: Uint8Array,
  moduleDrawCtx: ModuleDrawContext,
  gap: number,
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
      config.perModuleColorMode !== "solid" &&
      hasOverlayData,
    hasPalette: !isFastPreview && !!(config.palette && config.palette.length > 0),
    hasContrastGuard: !isFastPreview && !!(config.contrastGuard && config.minContrastRatio),
    hasJitter: !isFastPreview && !!(config.moduleJitterPx && config.moduleJitterPx > 0),
    jitterPx: isFastPreview ? 0 : config.moduleJitterPx || 0,
    frameIndex: config.frameIndex || 0,
    pixelSnap: config.pixelSnap || "floor",
    gap,
    isFastPreview,
    useGradient: useGradient === true,
    gradientFill,
  };
}
