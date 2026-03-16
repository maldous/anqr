import { isFixedDarkModule } from "./is-fixed-dark-module";
import { computeModuleViolation } from "./compute-module-violation";
import { scoreModulePixels } from "./score-module-pixels";
import type { ConstraintCandidate } from "./constraint-candidate";
import type { ConstraintCtx } from "./constraint-ctx";

export function buildConstraintCandidates(ctx: ConstraintCtx): {
  candidates: ConstraintCandidate[];
  totalViolationEnergy: number;
} {
  const {
    qr,
    moduleCount,
    occupancies,
    centerOcc,
    darkMinMap,
    lightMaxMap,
    darkCenterMinMap,
    lightCenterMaxMap,
    locked,
    occViolationWeight,
    centerViolationWeight,
  } = ctx;
  const candidates: ConstraintCandidate[] = [];
  let totalViolationEnergy = 0;

  for (let mr = 0; mr < moduleCount; mr++) {
    for (let mc = 0; mc < moduleCount; mc++) {
      if (locked[mr][mc]) continue;
      if (isFixedDarkModule(mr, mc, moduleCount)) continue;
      const violation = computeModuleViolation(
        qr.isDark(mr, mc),
        occupancies[mr][mc],
        centerOcc[mr][mc],
        darkMinMap[mr][mc],
        lightMaxMap[mr][mc],
        darkCenterMinMap[mr][mc],
        lightCenterMaxMap[mr][mc],
      );
      if (!violation) continue;
      totalViolationEnergy +=
        violation.occViolation * occViolationWeight +
        violation.centerViolation * centerViolationWeight;
      scoreModulePixels(
        ctx,
        mr,
        mc,
        violation.occViolation,
        violation.centerViolation,
        violation.toDark,
        candidates,
      );
    }
  }
  return { candidates, totalViolationEnergy };
}
