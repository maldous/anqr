import { isAlignmentPattern, isFinderPattern, isTimingPattern } from './pixel-mapping';

export function isEvalStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  alignmentPositions: number[]
): boolean {
  return (
    isFinderPattern(row, col, moduleCount) ||
    isTimingPattern(row, col) ||
    isAlignmentPattern(row, col, alignmentPositions)
  );
}
