import { createLogger } from "../../../../../observability/logging/src";
import { dispatchPixelRender } from "./dispatch-pixel-render";
import type { PixelGridCtx } from "../scaled-render-types";

const log = createLogger("GENERATE");

export { drawScaledDitherBackdrop } from "./draw-scaled-dither-backdrop";
export { drawScaledPatternContrastBoostOverlay } from "./draw-scaled-pattern-contrast-boost-overlay";
export { drawScaledStrictFunctionOverlay } from "./draw-scaled-strict-function-overlay";
export { enforceScaledQuietZoneClean } from "./enforce-scaled-quiet-zone-clean";

export function renderScaledPixelGrid(pgctx: PixelGridCtx): void {
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
        log.debug("ScaledRender samplePixel", { y, x, isDark, color });
      }
      dispatchPixelRender(pgctx, x, y, isDark, color, shouldDrawLightPixel);
    }
  }
}
