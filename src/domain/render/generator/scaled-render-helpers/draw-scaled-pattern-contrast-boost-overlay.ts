import { isScaledPatternBoostModule } from "./is-scaled-pattern-boost-module";
import { blendPreservationPass, createBlendPreservationContext } from "./scaled-pixel-grid-blend";
import type { PatternBoostCtx } from "../scaled-render-types";

export function drawScaledPatternContrastBoostOverlay(bctx: PatternBoostCtx): void {
  if (bctx.finderStrengthN <= 0) return;
  const bf = bctx.boostFlags;
  if (
    !(
      bf.finderContrastBoost ||
      bf.alignmentContrastBoost ||
      bf.timingContrastBoost ||
      bf.formatContrastBoost ||
      bf.versionContrastBoost ||
      bf.fixedDarkContrastBoost
    )
  ) {
    return;
  }
  const boostedModules: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < bctx.moduleCount; row++) {
    for (let col = 0; col < bctx.moduleCount; col++) {
      if (!isScaledPatternBoostModule(bctx.functionalMap[row * bctx.moduleCount + col], bf))
        continue;
      boostedModules.push({ row, col });
    }
  }
  if (boostedModules.length === 0) return;
  if (bctx.blendPreservations) {
    blendPreservationPass(createBlendPreservationContext(bctx), boostedModules);
    return;
  }
  bctx.ctx.save();
  bctx.ctx.globalAlpha = bctx.finderStrengthN;
  for (const { row, col } of boostedModules) {
    const x = bctx.marginPx + col * bctx.effectiveModuleSize;
    const y = bctx.marginPx + row * bctx.effectiveModuleSize;
    bctx.ctx.fillStyle = bctx.qr.isDark(row, col) ? "rgb(0,0,0)" : "rgb(255,255,255)";
    bctx.ctx.fillRect(x, y, bctx.effectiveModuleSize, bctx.effectiveModuleSize);
  }
  bctx.ctx.restore();
}
