import { updateSingleModuleStats } from './update-single-module-stats';
import type { ConstraintCtx } from './constraint-ctx';

export function recomputeConstraintStats(ctx: ConstraintCtx): void {
  for (let mr = 0; mr < ctx.moduleCount; mr++) {
    for (let mc = 0; mc < ctx.moduleCount; mc++) {
      updateSingleModuleStats(ctx, mr, mc);
    }
  }
}
