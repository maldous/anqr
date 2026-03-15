export function countShiftedDiffs(
  original: boolean[][],
  regen: boolean[][],
  moduleCount: number,
  dr: number,
  dc: number
): number {
  let diffCount = 0;

  for (let r = 0; r < moduleCount; r += 1) {
    const rr = r + dr;
    if (rr < 0 || rr >= moduleCount) {
      diffCount += moduleCount;
      continue;
    }

    for (let c = 0; c < moduleCount; c += 1) {
      const cc = c + dc;
      if (cc < 0 || cc >= moduleCount) {
        diffCount += 1;
        continue;
      }

      if (original[r][c] !== regen[rr][cc]) {
        diffCount += 1;
      }
    }
  }

  return diffCount;
}
