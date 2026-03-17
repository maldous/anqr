import { clamp01 } from "./clamp01";
import { isFunctionalPatternModule } from "./is-functional-pattern-module";
import { computeModuleOccupancy } from "./compute-module-occupancy";
import type { ConstraintCtx } from "./constraint-ctx";

export function updateSingleModuleStats(ctx: ConstraintCtx, mr: number, mc: number): void {
  const { darkCount, centerDarkCount, desireSum, desireSq } = computeModuleOccupancy(ctx, mr, mc);
  ctx.occupancies[mr][mc] = darkCount / ctx.total;
  ctx.centerOcc[mr][mc] = centerDarkCount / Math.max(1, ctx.centerArea);
  const mean = desireSum / ctx.total;
  const variance = Math.max(0, desireSq / ctx.total - mean * mean);
  const contrast = clamp01(Math.sqrt(variance) * 3.2);
  ctx.darkMinMap[mr][mc] = clamp01(
    Math.max(0.34, Math.min(0.5, ctx.baseDarkMin - contrast * 0.02)),
  );
  ctx.lightMaxMap[mr][mc] = clamp01(
    Math.max(0.5, Math.min(0.66, ctx.baseLightMax + contrast * 0.02)),
  );
  if (ctx.strictScanGate) {
    ctx.darkCenterMinMap[mr][mc] = clamp01(
      Math.max(
        ctx.darkMinMap[mr][mc] + 0.12,
        Math.min(0.68, ctx.darkMinMap[mr][mc] + 0.2 - contrast * 0.04),
      ),
    );
    ctx.lightCenterMaxMap[mr][mc] = clamp01(
      Math.min(
        ctx.lightMaxMap[mr][mc] - 0.12,
        Math.max(0.34, ctx.lightMaxMap[mr][mc] - 0.2 + contrast * 0.04),
      ),
    );
  } else {
    ctx.darkCenterMinMap[mr][mc] = clamp01(
      Math.max(
        ctx.darkMinMap[mr][mc] + 0.06,
        Math.min(0.56, ctx.darkMinMap[mr][mc] + 0.12 - contrast * 0.03),
      ),
    );
    ctx.lightCenterMaxMap[mr][mc] = clamp01(
      Math.min(
        ctx.lightMaxMap[mr][mc] - 0.06,
        Math.max(0.44, ctx.lightMaxMap[mr][mc] - 0.12 + contrast * 0.03),
      ),
    );
  }
  if (ctx.finderBlendGuidance && isFunctionalPatternModule(mr, mc, ctx.moduleCount, ctx.version)) {
    if (ctx.qr.isDark(mr, mc)) {
      ctx.darkMinMap[mr][mc] = Math.max(ctx.darkMinMap[mr][mc], 0.58);
      ctx.darkCenterMinMap[mr][mc] = Math.max(ctx.darkCenterMinMap[mr][mc], 0.74);
    } else {
      ctx.lightMaxMap[mr][mc] = Math.min(ctx.lightMaxMap[mr][mc], 0.26);
      ctx.lightCenterMaxMap[mr][mc] = Math.min(ctx.lightCenterMaxMap[mr][mc], 0.14);
    }
  }
}
