export function scoreAlignmentCenter(
  rawMatrix: boolean[][],
  cx: number,
  cy: number
): { good: number; total: number; mismatches: string[] } {
  let good = 0;
  let total = 0;
  const mism: string[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const r = cy + dy;
      const c = cx + dx;
      const got = rawMatrix[r]?.[c] ? 1 : 0;
      const exp = Math.max(Math.abs(dx), Math.abs(dy)) === 2 || (dx === 0 && dy === 0) ? 1 : 0;
      total++;
      if (got === exp) good++;
      else if (mism.length < 6) mism.push(`(${r},${c}) exp=${exp} got=${got}`);
    }
  }
  return { good, total, mismatches: mism };
}
