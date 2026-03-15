import type { QRCodeInstance, QRGeneratorConfig } from './types';
import { recomputeConstraintStats } from './recompute-constraint-stats';
import { buildConstraintCandidates } from './build-constraint-candidates';
import { computeConstraintViolationEnergy } from './compute-constraint-violation-energy';
import { initConstraintContext } from './init-constraint-context';
import { applyRankedCandidates } from './apply-ranked-candidates';

export function enforceModuleConstraints(
  qr: QRCodeInstance,
  matrixBits: Uint8Array,
  desire: Float32Array,
  moduleCount: number,
  scale: number,
  scaledSize: number,
  version: number,
  config: QRGeneratorConfig
): void {
  const init = initConstraintContext(
    qr,
    matrixBits,
    desire,
    moduleCount,
    scale,
    scaledSize,
    version,
    config
  );
  if (!init) return;
  const { cctx, maxIters } = init;
  const total = scale * scale;

  recomputeConstraintStats(cctx);
  let prevViolationEnergy = computeConstraintViolationEnergy(cctx);

  for (let iter = 0; iter < maxIters; iter++) {
    const { candidates, totalViolationEnergy } = buildConstraintCandidates(cctx);

    if (totalViolationEnergy <= 1e-5) break;
    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.score - a.score);

    const applied = applyRankedCandidates(
      matrixBits,
      scaledSize,
      candidates,
      totalViolationEnergy,
      total
    );

    if (applied === 0) break;
    recomputeConstraintStats(cctx);
    const newViolationEnergy = computeConstraintViolationEnergy(cctx);
    if (prevViolationEnergy - newViolationEnergy < 1e-4) break;
    prevViolationEnergy = newViolationEnergy;
  }

  // Do not add a post-center-lock pass; it re-imprints module structure.
}
