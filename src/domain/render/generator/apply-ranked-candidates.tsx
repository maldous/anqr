import { pixelIndex } from './pixel-index';
import type { ConstraintCandidate } from './constraint-candidate';

export function applyRankedCandidates(
  matrixBits: Uint8Array,
  scaledSize: number,
  candidates: ConstraintCandidate[],
  totalViolationEnergy: number,
  total: number
): number {
  const targetGain = totalViolationEnergy * 0.9;
  const maxFlips = Math.max(
    1,
    Math.min(candidates.length, Math.ceil(totalViolationEnergy * total * 0.9))
  );
  let applied = 0;
  let gained = 0;
  for (let i = 0; i < candidates.length && applied < maxFlips && gained < targetGain; i++) {
    const c = candidates[i];
    if (c.score < -0.2 && gained > targetGain * 0.6) break;
    const idx = pixelIndex(c.x, c.y, scaledSize);
    const current = matrixBits[idx] === 1;
    if (c.toDark === current) continue;
    matrixBits[idx] = c.toDark ? 1 : 0;
    applied++;
    gained += c.scanGain;
  }
  return applied;
}
