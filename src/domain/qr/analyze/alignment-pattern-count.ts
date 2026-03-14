export function getAlignmentPatternCount(version: number): number {
  if (version < 2) return 0;
  const alignmentPositions = Math.floor(version / 7) + 2;
  const totalPositions = alignmentPositions * alignmentPositions;
  return totalPositions - 3;
}
