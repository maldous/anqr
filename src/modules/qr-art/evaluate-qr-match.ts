import { getAlignmentPositionsForVersion } from './get-alignment-positions-for-version';
import { isEvalStructuralModule } from './is-eval-structural-module';

export function evaluateQRMatch(
  qrIsDark: (row: number, col: number) => boolean,
  moduleCount: number,
  version: number,
  targets: boolean[][],
  importance: number[][]
): { score: number; matchingModules: number; totalControllable: number } {
  let weightedMatch = 0;
  let totalWeight = 0;
  let matchingModules = 0;
  let totalControllable = 0;
  const alignmentPositions = getAlignmentPositionsForVersion(version);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isEvalStructuralModule(row, col, moduleCount, alignmentPositions)) continue;
      totalControllable++;
      const weight = importance[row]?.[col] ?? 0.5;
      totalWeight += weight;
      const qrValue = qrIsDark(row, col);
      const targetValue = targets[row]?.[col] ?? false;
      if (qrValue === targetValue) {
        weightedMatch += weight;
        matchingModules++;
      }
    }
  }

  return {
    score: totalWeight > 0 ? weightedMatch / totalWeight : 0,
    matchingModules,
    totalControllable,
  };
}
