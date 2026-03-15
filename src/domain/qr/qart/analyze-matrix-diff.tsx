import { buildStructuralPositionSet } from './build-structural-position-set';

export function analyzeMatrixDiff(
  baseMatrix: boolean[][],
  finalMatrix: boolean[][],
  moduleCount: number
): {
  diffCount: number;
  structuralDiffCount: number;
  dataDiffCount: number;
  sampleDiffs: Array<{
    row: number;
    col: number;
    base: boolean;
    final: boolean;
    isStructural: boolean;
  }>;
} {
  let diffCount = 0;
  let structuralDiffCount = 0;
  let dataDiffCount = 0;
  const sampleDiffs: Array<{
    row: number;
    col: number;
    base: boolean;
    final: boolean;
    isStructural: boolean;
  }> = [];

  const structuralPositions = buildStructuralPositionSet(moduleCount);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const baseVal = baseMatrix[row]?.[col] ?? false;
      const finalVal = finalMatrix[row]?.[col] ?? false;
      if (baseVal !== finalVal) {
        diffCount++;
        const isStructural = structuralPositions.has(`${row},${col}`);
        if (isStructural) {
          structuralDiffCount++;
        } else {
          dataDiffCount++;
        }
        if (sampleDiffs.length < 10) {
          sampleDiffs.push({ row, col, base: baseVal, final: finalVal, isStructural });
        }
      }
    }
  }

  return { diffCount, structuralDiffCount, dataDiffCount, sampleDiffs };
}
