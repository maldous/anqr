export function checkTimingPosition(
  rawMatrix: boolean[][],
  r: number,
  c: number,
  index: number,
  mismatches: Array<{ r: number; c: number; exp: 0 | 1; got: 0 | 1 }>
): void {
  const exp: 0 | 1 = index % 2 === 0 ? 1 : 0;
  const got: 0 | 1 = rawMatrix[r]?.[c] ? 1 : 0;
  if (exp !== got && mismatches.length < 12) mismatches.push({ r, c, exp, got });
}
