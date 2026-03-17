export function isAlignmentPattern(
  row: number,
  col: number,
  alignmentPositions: number[],
): boolean {
  for (const r of alignmentPositions) {
    for (const c of alignmentPositions) {
      if (
        (r < 9 && c < 9) ||
        (r < 9 && c > alignmentPositions[alignmentPositions.length - 1] - 9)
      ) {
        continue;
      }

      if (row >= r - 2 && row <= r + 2 && col >= c - 2 && col <= c + 2) {
        return true;
      }
    }
  }

  return false;
}
