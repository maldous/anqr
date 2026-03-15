import { drawTimingModule } from '../drawing';
import { resolveDarkFillStyle } from './resolve-dark-fill-style';
import type { StructuralPreservationCtx } from '../scaled-render-types';

export function preserveTimingModules(spctx: StructuralPreservationCtx): void {
  const {
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    qr,
    config,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor,
    useGradient,
    gradientFill,
  } = spctx;
  const timingStyle = config.timingStyle || 'match_module';
  const darkFill = resolveDarkFillStyle(
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    useGradient,
    gradientFill
  );
  for (let col = 8; col < moduleCount - 8; col++) {
    const isDark = qr.isDark(6, col);
    const x = marginPx + col * effectiveModuleSize;
    const y = marginPx + 6 * effectiveModuleSize;
    if (isDark) {
      ctx.fillStyle = darkFill;
      drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
    } else {
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }
  }
  for (let row = 8; row < moduleCount - 8; row++) {
    const isDark = qr.isDark(row, 6);
    const x = marginPx + 6 * effectiveModuleSize;
    const y = marginPx + row * effectiveModuleSize;
    if (isDark) {
      ctx.fillStyle = darkFill;
      drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
    } else {
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }
  }
}
