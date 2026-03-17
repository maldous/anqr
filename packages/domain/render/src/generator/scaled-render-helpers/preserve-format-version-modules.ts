import { paintClassifiedModule } from "./paint-classified-module";
import { preserveFixedDarkModule } from "./preserve-fixed-dark-module";
import { resolveDarkFillStyle } from "./resolve-dark-fill-style";
import type { StructuralPreservationCtx } from "../scaled-render-types";

export function preserveFormatVersionModules(spctx: StructuralPreservationCtx): void {
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
  } = spctx;
  const shouldProtectFormatInfo = !forceBinaryFunctionPatterns && protectFormat;
  const shouldProtectVersionInfo = !forceBinaryFunctionPatterns && protectVersion;
  if (!shouldProtectFormatInfo && !shouldProtectVersionInfo) return;
  const darkFill = resolveDarkFillStyle(
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    useGradient,
    gradientFill,
  );
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      paintClassifiedModule(
        ctx,
        getPatternFlags(row, col),
        qr.isDark(row, col),
        marginPx + col * effectiveModuleSize,
        marginPx + row * effectiveModuleSize,
        effectiveModuleSize,
        darkFill,
        effectiveBgColor,
        shouldProtectFormatInfo,
        shouldProtectVersionInfo,
      );
    }
  }
  preserveFixedDarkModule(ctx, marginPx, moduleCount, effectiveModuleSize, darkFill);
}
