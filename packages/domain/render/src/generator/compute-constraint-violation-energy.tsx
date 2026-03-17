import { isFixedDarkModule } from "./is-fixed-dark-module";
import type { ConstraintCtx } from "./constraint-ctx";

export function computeConstraintViolationEnergy(ctx: ConstraintCtx): number {
  let energy = 0;
  for (let mr = 0; mr < ctx.moduleCount; mr++) {
    for (let mc = 0; mc < ctx.moduleCount; mc++) {
      if (ctx.locked[mr][mc]) continue;
      if (isFixedDarkModule(mr, mc, ctx.moduleCount)) continue;
      const qrIsDark = ctx.qr.isDark(mr, mc);
      if (qrIsDark) {
        const occViolation = Math.max(0, ctx.darkMinMap[mr][mc] - ctx.occupancies[mr][mc]);
        const centerViolation = Math.max(0, ctx.darkCenterMinMap[mr][mc] - ctx.centerOcc[mr][mc]);
        energy +=
          occViolation * ctx.occViolationWeight + centerViolation * ctx.centerViolationWeight;
      } else {
        const occViolation = Math.max(0, ctx.occupancies[mr][mc] - ctx.lightMaxMap[mr][mc]);
        const centerViolation = Math.max(0, ctx.centerOcc[mr][mc] - ctx.lightCenterMaxMap[mr][mc]);
        energy +=
          occViolation * ctx.occViolationWeight + centerViolation * ctx.centerViolationWeight;
      }
    }
  }
  return energy;
}
