import { pixelIndex } from './pixel-index';
import { scorePixelCandidate } from './score-pixel-candidate';
import type { ConstraintCandidate } from './constraint-candidate';
import type { ConstraintCtx } from './constraint-ctx';

export function scoreModulePixels(
  ctx: ConstraintCtx,
  mr: number,
  mc: number,
  occViolation: number,
  centerViolation: number,
  toDark: boolean,
  out: ConstraintCandidate[]
): void {
  const {
    matrixBits,
    desire,
    scale,
    scaledSize,
    total,
    centerRadius,
    centerArea,
    moduleCenter,
    occViolationWeight,
    centerViolationWeight,
    scanScoreWeight,
    artPenaltyWeight,
    edgeBandPenalty,
    centerPixelBonus,
  } = ctx;

  const y0 = mr * scale;
  const x0 = mc * scale;
  for (let y = 0; y < scale; y++) {
    for (let x = 0; x < scale; x++) {
      const yy = y0 + y;
      const xx = x0 + x;
      const current = matrixBits[pixelIndex(xx, yy, scaledSize)] === 1;
      const inCenter =
        Math.abs(y - moduleCenter) <= centerRadius && Math.abs(x - moduleCenter) <= centerRadius;
      const edgeBand = x <= 1 || y <= 1 || x >= scale - 2 || y >= scale - 2;
      const d = desire[pixelIndex(xx, yy, scaledSize)];

      const result = scorePixelCandidate(
        current,
        toDark,
        inCenter,
        d,
        edgeBand,
        occViolation,
        centerViolation,
        total,
        centerArea,
        occViolationWeight,
        centerViolationWeight,
        scanScoreWeight,
        artPenaltyWeight,
        edgeBandPenalty,
        centerPixelBonus
      );
      if (result) {
        out.push({ y: yy, x: xx, score: result.score, toDark, scanGain: result.scanGain });
      }
    }
  }
}
