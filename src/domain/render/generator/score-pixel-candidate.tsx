export function scorePixelCandidate(
  current: boolean,
  toDark: boolean,
  inCenter: boolean,
  d: number,
  edgeBand: boolean,
  occViolation: number,
  centerViolation: number,
  total: number,
  centerArea: number,
  occViolationWeight: number,
  centerViolationWeight: number,
  scanScoreWeight: number,
  artPenaltyWeight: number,
  edgeBandPenalty: number,
  centerPixelBonus: number
): { score: number; scanGain: number } | null {
  if (toDark === current) return null;
  const occGain = occViolation > 0 ? Math.min(occViolation, 1 / total) * occViolationWeight : 0;
  const centerGain =
    inCenter && centerViolation > 0
      ? Math.min(centerViolation, 1 / centerArea) * centerViolationWeight
      : 0;
  const scanGain = occGain + centerGain;
  if (scanGain <= 0) return null;

  const beforeErr = Math.abs((current ? 1 : 0) - d);
  const afterErr = Math.abs((toDark ? 1 : 0) - d);
  const artPenalty = afterErr - beforeErr;
  const edgePen = edgeBand ? edgeBandPenalty : 0;
  const centerBonus = inCenter ? centerPixelBonus : 0;
  const score = scanGain * scanScoreWeight - artPenalty * artPenaltyWeight - edgePen + centerBonus;
  return { score, scanGain };
}
