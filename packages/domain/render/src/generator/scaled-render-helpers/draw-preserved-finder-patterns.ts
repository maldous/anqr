import { drawFinderPatternComplete } from "../drawing";
import { resolveBinaryConfig } from "./resolve-binary-config";
import type { StructuralPreservationCtx } from "../scaled-render-types";

export function drawPreservedFinderPatterns(spctx: StructuralPreservationCtx): void {
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
    effectiveBgColor,
  );
  for (const pos of [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ]) {
    drawFinderPatternComplete(
      ctx,
      marginPx + pos.col * effectiveModuleSize,
      marginPx + pos.row * effectiveModuleSize,
      effectiveModuleSize,
      resolvedConfig,
    );
  }
}
