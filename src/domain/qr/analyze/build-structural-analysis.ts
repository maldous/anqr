import { getAlignmentPatternCount } from './alignment-pattern-count-for-version';

export function buildStructuralAnalysis(version: number | null) {
  return {
    hasFinderPatterns: true,
    hasTimingPatterns: true,
    hasAlignmentPatterns: version === null ? false : version > 1,
    alignmentPatternCount: version === null ? 0 : getAlignmentPatternCount(version),
  };
}
