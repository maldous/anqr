export function getAlignmentPatternCount(version: number): number {
  if (version === 1) return 0;
  if (version <= 6) return 1;
  const positions = Math.floor(version / 7) + 2;
  return Math.max(1, positions * positions - 3);
}
