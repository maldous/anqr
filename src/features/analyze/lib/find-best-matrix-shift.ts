import { countShiftedDiffs } from './count-shifted-diffs';

export function findBestMatrixShift(
  originalMatrix: boolean[][],
  regenMatrix: boolean[][],
  moduleCount: number
): { dr: number; dc: number; diffCount: number; diffPct: number } {
  let best = { dr: 0, dc: 0, diffCount: Number.POSITIVE_INFINITY };

  for (let dr = -2; dr <= 2; dr += 1) {
    for (let dc = -2; dc <= 2; dc += 1) {
      const diffCount = countShiftedDiffs(originalMatrix, regenMatrix, moduleCount, dr, dc);
      if (diffCount < best.diffCount) {
        best = { dr, dc, diffCount };
      }
    }
  }

  return {
    ...best,
    diffPct: moduleCount * moduleCount ? best.diffCount / (moduleCount * moduleCount) : 0,
  };
}
